pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{

    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;


    //keeps track of staker addresses
    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {

        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stake tokens
    function stakeTokens(uint _amount) public {
        //Require staking amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        //Transfer Mock DAi tokens ot this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //update staking staking Balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to staker array only if they haven't staked already
        if(!hasStaked[msg.sender]){
            stakers.push (msg.sender);
        }

        //Update staking Status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Issuing Tokens
    function issueTokens() public{
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all Stakers
        for (uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
            dappToken.transfer(recipient, balance);
            }
        }

    }

    //Unstaking Tokens
    function unstakeTokens() public {
        //fetch staking blaance
        uint balance = stakingBalance[msg.sender];

        //require amount greater than 0
        require (balance > 0, "staking balance cannot be 0");

        //Transfer Mock DAI tokens to this contract for staking
        daiToken.transfer(msg.sender, balance);

        //Reset staking balance
        stakingBalance[msg.sender] = 0;

        //Update staking status
        isStaking[msg.sender] = false;
    }
}