const { messagePrefix } = require("@ethersproject/hash")

;/RUN COMM: yarn add --dev hardhat/
;/RUN COMM: yarn hardhat > create an empty hardhat config/
//RUN COMM: yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv/
// The above command is copied from the git hub repo of this course section located at: https://github.com/smartcontractkit/full-blockchain-solidity-course-js
// We wanna use "events" whenever we want to update these dynamically sized data structures
;/ EVM has a feature called "logging"/
//when things happen on BC, EVM writes these things to a specific data structure called its "log". We can actually read these logs from our BC nodes that we run.
// if we you run a node/connect a node, then you make an "get eth_logs" call to get the logs. Inside these logs the log we are interested in is the "events". "Logs" and "events" are used synonymously
;/Events allow you to "print" stuff to this log/
//this is done in a way thats more gas efficient than storing it in "storage variable", SC cant access logs and event as they are saved in a data structure that is saved to be gas efficient
// thats the trade off, we can print some info that important to us without having to store in a storage variable which takes much more gas
;/ All these events are tied to the SC that emitted these events in these txs/
//listening to these events is very helpful i.e., you want to listen for some tx when someone intereacts with the SC so that you can trigger a response. THis is how a lot of Off-Chain infrastructure works
// if you have a website and it reloads when a tx completes, it was actually listening for that tx finish /\ it is really important for "front-end"
// sometimes there too many events; chainlinks listens for requests data events to do variety of task, while "the Graph" keeps these events organized in an indexed "graph" so that its easy to querry them later on
;/ event Example/
//     event storedNumber{              a new EVENT of type storedNumber
//              uint256 indexed oldNumber;
//              uint256 indexed newNumber;
//              uint256 addedNumber;
//              address sender
//};
// We have this new event thing we are gonna be emitting things of type "storedNumber" in the future
//When we emit this event is gonna have these 4 parametres
;/Indexed for Indexed parametres keyword/
// You can use upto 3 "indexed"
;/indexed parameters = topics/
// indexed parameters are searchable
//non indexed are very hard to search because they become "ABI" coded and you need to know the ABI to search for them
//we need to "emit" that event, in order to store that data into logging data structure of the EVM
;/ "emit" and event/
//    emit storedNumber(
//     favoriteNumber;
//     favoriteNumber;
//     favoriteNumber + favoriteNumber;
//     msg.sender
//    )
// I have saved the sample event emit smart contract in a file name "sampleEventEmit", need to rename for the extension correction to use it
//whenever we call the store function on that sample SC, we are going to emit this storeNumber event
//here is the example of the tx where we call the "store" function with a value of 1, looking at the log of what an event look like
//------Good syntax for naming "Events" is the name of the function in reverse
;/ VRF version 2--/
// Version VRF 2 allows you to fund a subscription account with LINK which can have multiple SC
//Purposely a 2 tx process to call random Numbers- If it was 1 tx process, then poeple would brute force try and simulate the tx and
//manipulate it in a way to make them be the winner of the rafflevr
;/Sample contract*/
//@ chainlink.docs there is a sample contract which coordinates witha verified chainlink node to give us the random number that we want
;/---1st tx will request the RANDOM NUMBER and the 2nd tx will be the one in which we get the RANDOM NUMBER and in the same tx we*/
;/get to send the winner the money or the reward he won*/
//RUN COMM: yarn add --dev @chainlink/contracts
//we need to make our Raffle.sol SC VRFConsumerBase-able     We need to inherit our V2ConsumerBase
;/virtual function are meant to be overriden*/
//fulfillRandomWords is a internal "virtual" function, because it is expecting to be overriden; The reason that its in this
// VRFConsumerBaseV2 is so that "vrfCoordinatorV2" knows it can call this "fulfillRandomWords" function
// in VRFConsumerBaseV2's Constructor we need to pass that vrfCoordinatorV2
;/VRF Coordinator is the address of the SC that does the random number verification/
// So right next to our constructor, we will add VRFConsumerBaseV2*constructor* We need to pass the VRFCoordinatorV2 address
;/---------Hardhat SHORTHAND---------*/
//hardhat shorthand is an NPX package that install a globally accessbile binary called "hh" that runs the projects' locally
//installed "hardhat" and support shell for autocomletion for task
// RUN COMM: yarn global add hardhat-shorthand           ------- This command does give us "hh" short command for "yarn hardhat", so instead RUN COMM: npm install --global hardhat-shorthand
;/ Now you can run "yarn hardhat compile" command just by using "hh compile"/
//on the VRFCoordinator address, we need to call "requestRandomWords" function, we need to call this function on the coordinator SC
// to get the coordinator contract we use VRFCoordinatorV2Interface(vrfCoordinator), where vrfCoordinator is the address, so we wanna
//keep track of this
// then we can save using the address
;/imported chainLink SC to request randomNumbers, and then setting a function in that SC, "requestRandomWords" function should be called/
//  that "requestRandomWords" function has parametres which are defined as follows:
;/keylash/
// gasLane, is the specific max gasLimits,if the gas goes too high
//you wanna set a max limit thereby saying dont give me that randomWord
;/subscriptionId*/
//there is a contract onchain which we can use to fund different contracts for any of these data or external computatioanl bits
// in this contract there's a list of subscription for people to make request to, so we need the ID of the subscription that we're using to request
//randomNumbers and pay Oracle gas
//The subscriptionId is also goona be that we're gonna pass as the input parametre to our lottery
;/requestConfirmatiosn*/
// How manny confirmations the Chainlink node should wait before responding/ The longer the node awaits, the more secure the random values is.
//it must be greater than the "minimumRequestBlockConfirmations" limit on the coordinator contact.
;/REQUEST_CONFIRMATIONS*/
// the limit of how much gas to use for callback request to your SC's fulfillRandmWords() function, this is really important because if it gets
//too expensive gas-wise then we want to abort and dont want to continue calling the function
// we want to parameterizable this REQUEST_CONFIRMATIONS, because we want to change it depending on how we code our fulfill randomWords
;/numWords*/
//How many random values to request. we Only want one
;/requestRandomWords*/
//returns a request ID, a "uint256" requestId, a unique ID that defines who is requesting this and this other info
;/ Set this Raffle SC so that it chainLink keepers can call this on an interval/
// for that we have created events and emit
;/setting up what to do when we get that Random Number/
//once we get that random number we want to pick a RandomWinner from that array of "players"
;/Modulo function/
//https://docs.soliditylang.org/en/v0.8.13/types.html?highlight=modulo#modulo
// our random numbers and random words is gonna be an array, but we requested only 1 random Word while the random number is gonna so an array
//how do we pick a randomw winner out of random number that are totally independant of each other
// we use "Mode function"
// let say,     s_player "array" contains 10 player indexed from 0-9 and the random number we got from "chainLink VRF" is 202
// s_player = 10
// random number = 202
// 202 % 10 ? divide 202 by 10 but instead of decimal, use division evenly and the left of it as remainder
// i.e., 202 divides as 200/10= 20, "2" is the remainder
//or 20 * 10 = 200 ,    remainder 2
// you write this in mode function as:         202 % 10 = 2
;/ chainlink Keepers*/
//First you write a SC, which is a sample contract you can get from Chainlink docs,   https://docs.chain.link/docs/chainlink-keepers/compatible-contracts/
// chainlink keeper compatible SC use 2 important methods that are part of this keeper compatible interface;
//1. Check upKeep(where offChain computation happens)  you can generate data off-chain and then pass that in thats called "checkData" which becomes the "perfromData" and gets passed to "performUpkeep"
//2.performUpkeep is the method where you verfiy that things are correct and if should be modified and run on chain, actually make the state change
//then deploy it to a test net, and then you register it as "upKeep", copy the address of the SC you deployed for registeration
// most of the regieration forms can be filled with info we know except "chechData", which is special that you can register multliple upKeeps on the same SC and pass in data to specify how you want to
//check upKeep to be run, that  "checkData" is optional, after registering you should be done
// once the registeration is done, as soon as the next round of keeper nodes executes(roughly about every block), we should see that the checkUpKeep method is going to return "upKeep is needed"
;/ Implementing ChainLink Keepers (upKeep)*/
// We need two functions in our SC in order to use ChainLink Keepers; 1. checkUpKeep,   2. performUpKeep
//CHECHUPKEEP checks if its time to use and trigger ChainLinkKeepers and requestRandomWord in our SC
//PERFORMUPKEEP request the randomWord
// so in our SC, "requestRandomWinner" is technically a "performUpKeep" function we need in order to use ChainLink Keepers
;/block.timestamp*/
//retunrs the accurate time of the BC at the current time
;/Registeration for subscription Id/
//Get our SubId for chainLink VRF
// Deploy our contract using the SubId
// Register the contract with chainLink VRF and its SubID
// Register the contract with ChainLink Keepers
// RUN staging tests
;/Before deploying be sure to check with github repo of the course  for the optimal hardhat.config. So that all the module.exports are there/
;/99-deploy-front-end.js/ // we created this deploy script for our front end that whenever we deploy our contracts, it updates our front end accodingly;
//  we want this fie to the last script to deploy so we named it "99"
// we write this script which is connected to our front end so that whenever we deploy the contracts and no matter what chain we are on; it runs our front-end accordingly and update our "constants" folder
// So another thing we did, is added a variable in the ".env" file, so that we configure if we want to update our front-end or not, because sometimes we dont want to care about front end
