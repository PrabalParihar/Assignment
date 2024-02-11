
// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZapitTradeContract {
    struct Order {
        address seller;
        address tokenAddress;
        uint256 amount;
        bool isERC20;
        bool isFulfilled;
        mapping(address => bytes32) buyerMessages;
        address[] registeredBuyers;
    }

    mapping(uint256 => Order) private orders;
    uint256 private nextOrderId;

    // Events
    event OrderCreated(uint256 orderId, address indexed seller, address indexed tokenAddress, uint256 amount, bool isERC20);
    event BuyerRegistered(uint256 orderId, address indexed buyer, bytes32 message);
    event OrderFulfilled(uint256 orderId, address indexed buyer, bytes32 message);

    // Modifier to check if the caller is the seller of the order
    modifier onlySeller(uint256 orderId) {
        require(msg.sender == orders[orderId].seller, "Caller is not the seller of the order");
        _;
    }

    // Function to create an order
    function createOrder(address tokenAddress, uint256 amount, bool isERC20) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        if(isERC20) {
            require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }
        
        uint256 orderId = nextOrderId++;
        Order storage order = orders[orderId];
        order.seller = msg.sender;
        order.tokenAddress = tokenAddress;
        order.amount = amount;
        order.isERC20 = isERC20;
        order.isFulfilled = false;

        emit OrderCreated(orderId, msg.sender, tokenAddress, amount, isERC20);
        return orderId;
    }

    // Function for a buyer to register with a random number message
    function registerAsBuyer(uint256 orderId, bytes32 message) external {
        Order storage order = orders[orderId];
        require(!order.isFulfilled, "Order is already fulfilled");
        order.buyerMessages[msg.sender] = message;
        order.registeredBuyers.push(msg.sender);

        emit BuyerRegistered(orderId, msg.sender, message);
    }

    // Function to fulfill an order
    function fulfillOrder(uint256 orderId, address buyer, bytes32 message) external onlySeller(orderId) {
        Order storage order = orders[orderId];
        require(!order.isFulfilled, "Order is already fulfilled");
        require(order.buyerMessages[buyer] == message, "Message does not match buyer's message");

        order.isFulfilled = true;
        if(order.isERC20) {
            require(IERC20(order.tokenAddress).transfer(buyer, order.amount), "Transfer failed");
        } else {
            payable(buyer).transfer(order.amount);
        }

        emit OrderFulfilled(orderId, buyer, message);
    }

    // Function to get order details
    function getOrderDetails(uint256 orderId) external view returns (address, address, uint256, bool, bool, address[] memory) {
        Order storage order = orders[orderId];
        return (order.seller, order.tokenAddress, order.amount, order.isERC20, order.isFulfilled, order.registeredBuyers);
    }

    // Function to retrieve the message for a specific buyer
    function getBuyerMessage(uint256 orderId, address buyer) external view returns (bytes32) {
        return orders[orderId].buyerMessages[buyer];
    }

    // Fallback function to accept Ether
    receive() external payable {}
}

