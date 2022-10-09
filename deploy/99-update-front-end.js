const { ethers } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE = "../nextjs-smartcontract-lottery/constants/contractAddresses.json"
FRONT_END_ABI_FILE = "../nextjs-smartcontract-lottery/constants/abi.json"
module.exports = async (/*we dont want to deploy any SC here, so we leave this blank */) => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        updateContractAddresses()
        updateAbi()
    }
}
async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
    //in ethers.docs, ethers has this ".interface" object which returns an interface, different from solidity interface, allows us to get the ABI this way
}
async function updateContractAddresses() {
    const raffle = await ethers.getContract("Raffle")
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))
    const chainId = network.config.chainId.toString()
    if (chainId in currentAddresses) {
        //checking to see if the chainID that we are  running on has something set to do in "contractAddresses" file
        // if the chainId is in there, then we add the raffle.address
        if (!currentAddresses[chainId].includes(raffle.address)) {
            // checking to see if the address is not already in there
            //if the address is not already in there then
            currentAddresses[chainId].push(raffle.address) // we add the raffle address
        }
    }
    {
        currentAddresses[chainId] = [raffle.address] // if the chainId doesnt exist we are gonna add a new raffle.address array
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}
module.exports.tags = ["all", "frontend"]
