// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "./helpers/CCIPReceiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract CrossX is CCIPReceiver, OwnerIsCreator, Initializable {
    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.

    function initialize(address _router) public initializer {
        i_router = _router;
    }

    // @dev This function is used to deploy the contract across multiple chains
    // @param destinationChainSelector - destination chain selector of chainlink
    // @param salt - the salt used to create the contract address
    // @param bytecode - the bytecode of the contract
    // @param initializeData - the data used inside the initialize function of the contract
    function DeployOnMultiChains(
        uint64[] calldata destinationChainSelector,
        bytes32 salt,
        bytes memory bytecode,
        bytes memory initializeData
    ) external payable {
        (uint totalFee, Client.EVM2AnyMessage memory evm2AnyMessage) = getInfo(
            destinationChainSelector,
            salt,
            bytecode,
            initializeData
        );
        require(msg.value >= totalFee, "msg.value must equal totalFee");

        deployContract(salt, bytecode, initializeData);

        IRouterClient router = IRouterClient(this.getRouter());

        // sending deploy msg to other chains
        for (uint i = 0; i < destinationChainSelector.length; ) {
            uint256 fees = router.getFee(
                destinationChainSelector[i],
                evm2AnyMessage
            );

            router.ccipSend{value: fees}(
                destinationChainSelector[i],
                evm2AnyMessage
            );

            unchecked {
                ++i;
            }
        }
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        (bytes32 salt, bytes memory bytecode, bytes memory initializeData) = abi
            .decode(any2EvmMessage.data, (bytes32, bytes, bytes));
        deployContract(salt, bytecode, initializeData);
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for sending a text.
    /// @param _receiver is the address of the receiver.
    /// @param payload is the encoded value of bytecode, salt and initializeData
    /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        address _receiver,
        bytes memory payload,
        address _feeTokenAddress
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver), // ABI-encoded receiver address
            data: payload, // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array aas no tokens are transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 2_000_000, strict: false})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: _feeTokenAddress
        });
        return evm2AnyMessage;
    }

    // This function is used to deploy and initialize a contract
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @param initializable - whether the contract is initializable
    // @param initializeData - the data used to initialize the contract
    // @return address - the address of the deployed contract
    function deployContract(
        bytes32 salt,
        bytes memory bytecode,
        bytes memory initializeData
    ) public returns (address) {
        address deployedAddress = deploy(salt, bytecode);
        // transfer ownership to the _originSender
        if (initializeData.length > 0) {
            (bool success, ) = deployedAddress.call(initializeData);
            require(success, "initiailse failed");
        }
        return deployedAddress;
    }

    // @dev This function is used to deploy a contract using CREATE2
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @return address - the address of the deployed contract
    function deploy(
        bytes32 salt,
        bytes memory bytecode
    ) public returns (address) {
        return Create2.deploy(0, salt, bytecode);
    }

    // @dev This function is used to compute the address of the contract that will be deployed
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @return address - the computed address of the contract that will be deployed
    function computeAddress(
        bytes32 salt,
        bytes memory bytecode
    ) public view returns (address) {
        return Create2.computeAddress(salt, keccak256(bytecode));
    }

    // @dev This function is used to get the required infos like fees and evm2AnyMessage
    // @param destinationChainSelector - destination chain selector of chainlink
    // @param salt - the salt used to create the contract address
    // @param bytecode - the bytecode of the contract
    // @param initializeData - the data used inside the initialize function of the contract
    function getInfo(
        uint64[] calldata destinationChainSelector,
        bytes32 salt,
        bytes memory bytecode,
        bytes memory initializeData
    )
        public
        view
        returns (uint totalFee, Client.EVM2AnyMessage memory evm2AnyMessage)
    {
        bytes memory payload = abi.encode(salt, bytecode, initializeData);
        evm2AnyMessage = _buildCCIPMessage(address(this), payload, address(0));
        IRouterClient router = IRouterClient(this.getRouter());

        // sending deploy msg to other chains
        for (uint i = 0; i < destinationChainSelector.length; ) {
            uint256 fees = router.getFee(
                destinationChainSelector[i],
                evm2AnyMessage
            );
            totalFee += fees;
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Allows the contract owner to withdraw the entire balance of Ether from the contract.
    /// @dev This function reverts if there are no funds to withdraw or if the transfer fails.
    /// It should only be callable by the owner of the contract.
    /// @param _beneficiary The address to which the Ether should be sent.
    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();

        (bool sent, ) = _beneficiary.call{value: amount}("");

        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    receive() external payable {}
}
