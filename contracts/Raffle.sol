// SPDX-License-Identifier: MIT

// Pick a random winner ( verifiably random)
// Winner to be selected every X minutes > compleletely automated
// ChainLink Oracle > Randomness, Automated Execution > Chainlink Keepers
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";  // we need to import this contract or Interface in order to call "checkUpKeep" and 
//"performUpkeep" functions
error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__RaffleNotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**@title A sample Raffle Contract
 * @author Muhammad Muaaz
 * @notice This contract is for creating a sample raffle contract
 * @dev This implements the Chainlink VRF Version 2
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface { //inheriting VRFConsumerBaseV2 contract

/* Type declarations */
    enum RaffleState {  // creating states, so that we can stop people entering when lottery isnt open etc
        OPEN,
        CALCULATING
    }

/*--State Variable--*/

    // Enter the lottery (paying some amount)
    uint256 private immutable i_entranceFee /*-storage variable*/;  //immutable because its set one time 
    // and we want to save some gas
    address payable[] private s_players; // "payable" because if a player wins, then he should be getting the winning amount
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64  private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3; //using all caps for setting contstant variables 
    uint32 private immutable i_callbackGasLimit; 
    uint32 private constant NUM_WORDS = 1; 

//* Lottery Variables */
address private s_recentWinner;     
RaffleState private s_raffleState;
uint256 private s_lastTimeStamp;
uint256 private immutable i_interval;
 
 /*----EVENTS----*/
event RaffleEnter(address indexed player);
event RequestedRaffleWinner(uint requestId);
event WinnerPicked(address indexed player);

//VRF Coordinator is the address of the SC that does the random number verification
// VRFCONSUMERBASEV2 coordinator and we need to pass vrfCoordinatorV2 
//vrfCoordinatorV2 is the address of the contract that does the randomWord verification

/*Functions*/

constructor(address vrfCoordinatorV2, uint256 entranceFee, bytes32 gasLane, uint64 subscriptionId, uint32 callbackGasLimit, uint256 interval) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN; //opening lottery right after deploying the contract
        // s_raffleState = RaffleState(0);
         s_lastTimeStamp = block.timestamp; // block.timestamp  meaning getting the current block timestamp
         i_interval = interval;

        
    }
    function enterRaffle() public payable {
        //require.msgvalue > i_entranceFee, "Not Enough"
    if(msg.value < i_entranceFee) {revert Raffle__NotEnoughETHEntered();}
    if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
    }
    s_players.push(payable(msg.sender)); //payable was added beause "msg.msg.sender" it self isnt payable, and we need to pay
    //him back the win amount if he wins the raffle
    // Emit an event when we update  a dynamic array or mapping
    emit RaffleEnter(msg.sender);
    }
 /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The lottery is open. 
     * 2. The time interval has passed between raffle runs.
     * 3. at least 1 player has signed up for the raffle  
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(bytes memory/*calldata*/// as this function has syntax that needs to coorelating with the one we have imported so we need to incorporate the same 
    //elements like "returns" "bytes memory"
         /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory /*performData*/) //performData is used if we want to have "checkupKeep" do something 
    //depending on how this "checkUpKeep" function runs
       { bool isOpen = RaffleState.OPEN == s_raffleState;
        //(block.timestamp - last timestamp) > interval
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        /*bool*/ upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
         return (upkeepNeeded, "0x0"); // can we comment this out?
        }
function performUpkeep(bytes calldata /* performData, (if we had this in the checkUpKeep then we pass it here) */)/*requestRandomWinner*/ 
external override{
    (bool upkeepNeeded, ) = checkUpkeep("");
    // require(upkeepNeeded, "Upkeep not needed");
        if (!upkeepNeeded) {revert Raffle__UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
        }
       s_raffleState = RaffleState.CALCULATING; // defining this state to be "calculating" so that nobody enters when its time to announce the Winner
    // Purposely a 2 tx process to call random Numbers
    /*-------Request a Random Number------*/
    /*-------Do Something with that Number---*/
    //s_requestId = we dont need this 
   uint256 requestId = i_vrfCoordinator.requestRandomWords(  // saving this in a requestId
   /* We are gonna emit an "event" with this "requestId" */ 
    //The definitions for all of the parametres used here can be found @ 
    // https://docs.chain.link/docs/get-a-random-number
        /*keylash,*/ i_gasLane, //gasLane, is the specific max gasLimits,if the gas goes too high
        //you wanna set a max limit thereby saying dont give me that randomWord 
        i_subscriptionId,
        REQUEST_CONFIRMATIONS,
        i_callbackGasLimit, //the limit of how much gas to use for callback request to your SC's fulfillRandmWords() function
        NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);  // we later discovered that, vrfCoordinator Mock is also emiting an event where 2nd 
    //parameter is actually "requestId", so we dont have to emit this EVENT here, but we did anyways as an example to learn EVENTS

}
function fulfillRandomWords/*same as fulfillRandomNumbers*/(
        uint256 /*requestId*/, //not using requestId
        uint256[] memory randomWords
    ) internal override { //internal override /*This syntax is also found in the VRFConsumerBaseV2 SC with the same function*/{}
    // s_players size 10
        // randomNumber 202
        // 202 % 10 ? what's doesn't divide evenly into 202?
        // 202 / 10 = 200 + 2
	// 200 * 10 = 200
        // remainder 2
        // 202 % 10 = 2
    uint256 indexOfWinner = randomWords[0] % s_players.length; //randomWords array has only 1 indexed entry as it will at 0th position. players.length is gonna be 
    //whole length of the s_players array
    address payable recentWinner = s_players[indexOfWinner]; // getting the address of "indexofWinner"
    s_recentWinner = recentWinner;
    s_players = new address payable[](0); // after announcing the winner, we need to reset the "players" array to zero
    s_raffleState = RaffleState.OPEN; 
    s_lastTimeStamp = block.timestamp;
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    // we could also write the above code as:  require(success, "Transfer failed");
    if (!success) {
             revert Raffle__TransferFailed();
    }
    emit WinnerPicked(recentWinner);
}
/** Getter Functions */
/*View-Pure Functions*/
    
    function getEntranceFee() public view returns(uint256) {// getter function for the users of SC who need to know the entrance fee
        return i_entranceFee;    
    }
    function getPlayer(uint256 index) public view returns(address){
        return s_players[index];
    }
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }
    function getNumWords() public pure/*view*/ returns (uint256) { //we cant use "view" keyword here as NUM_WORDS is a constant variable 
    // you cant read from the storage like, it would have replaced NUM_WORDS with 1
        return NUM_WORDS;
    }
    function getNumberOfPlayers() public view returns (uint256) {
    return s_players.length;
    }
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }
    function getInterval() public view returns(uint256) {
        return i_interval;
    }

}