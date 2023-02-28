const INFURA_API = 'https://mainnet.infura.io/v3/a863a357d92641fcaa7f794b3f81cf7d'
import { ethers } from "ethers";
const provider = new ethers.providers.JsonRpcProvider(INFURA_API)
const main = async () => {
    const network = await provider.getNetwork()
    console.log("\n1: 查询网络");
    console.log("Network Name: " + network.name);
    console.log("ChainID: " + network.chainId);

	const blockNumber = await provider.getBlockNumber();
    console.log("\n2: 查询区块高度");
	console.log("区块高度: " + blockNumber)


	const gasPrice = await provider.getGasPrice();
    console.log("\n3: 查询gas价");
	console.log("当前gas price: ",  gasPrice)

	const feeData = await provider.getFeeData();
    console.log("\n4: 查询当前建议的gas设置");
	console.log("当前建议的gas设置: " ,  feeData)

	const block = await provider.getBlock(12);
    console.log("\n5: 查询区块信息");
	console.log("12号区块的信息: " ,  block)

    const code = await provider.getCode("0xc778417e063141139fce010982780140aa0cd5ab"); // WETH
    console.log("\n6: 查询合约地址的bytecode");
    console.log("WETH合约的bytecode: ", code)
}
main()
