/*
 *  接口类
 *  ethers.js 的接口类抽象了与以太坊网络上的合约交互所需的 ABI 编码和解码
 *  
 *  可以利用 abi 生成或者直接从合约中获取 interface 变量
 *  // 利用 abi 生成
 *  const interface = ethers.utils.Interface(abi)
 * 
 *  // 直接从 contract 中获取
 *  const interface2 = contractObj.interface
 *
 *  接口类封装了一些编码解码的方法, 与一些特殊合约交互时(如代理合约), 需要
 *  编码参数, 解码返回值: (相关函数必须包含在abi中)
 *  - getSigHash(): 获取函数选择器(function selector)
 *		interface.getSigHash("balanceOf");
 *  - encodeDeploy(): 编码构造器的参数, 可以附在合约字节码的后面
 *		interface.encodeDeploy("Wrapped ETH", "WETH");
 *	- encodeFunctionData(): 编码函数的calldata
 *		interface.encodeFunctionData("balanceOf",["0xc7784...");
 *	- decodeFunctionResult(): 解码函数的返回值
 *		interface.decodeFunctionResult("balanceOf", resultData);
 *
 */

import { ethers } from "ethers";

// 与测试网 WETH 合约交互
//准备 alchemy API 
const ALCHEMY_GOERLI_URL = 'https://eth-rinkeby.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
// TODO: could not detect network

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
];

// WETH合约地址（Goerli测试网）
const addressWETH = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
// 声明WETH合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)

const address = await wallet.getAddress()
// 1. 读取WETH合约的链上信息(WETH abi)
console.log("1. 读取WETH余额")

// 编码calldata
const param1 = contractWETH.interface.encodeFunctionData(
    "balanceOf",
    [address]
  );
// const param1 = ethers.utils.Interface(abiWETH).interface.encodeFunctionData(
//     "balanceOf",
//     [address]
//   );
console.log(`编码结果： ${param1}`)

// 创建交易
const tx1 = {
    to: addressWETH,
    data: param1
}

// 发起交易, 可读操作(view/pure)可以用 provider.call(tx)
const balanceWETH = await provider.call(tx1)
console.log(`存款前WETH持仓: ${ethers.utils.formatEther(balanceWETH)}\n`)

// 编码calldata
const param2 = contractWETH.interface.encodeFunctionData("deposit");
console.log(`编码结果: ${param2}`)

// 创建交易
const tx2 = {
    to: addressWETH,
    data: param2,
    value: ethers.utils.parseEther("0.001")
}

// 发起交易, 写入操作需要 wallet.sendTransaction(tx)
const receipt1 = await wallet.sendTransaction(tx2)
// 等待交易上链
await receipt1.wait()

console.log(`交易详情:`)
console.log(receipt1)
const balanceWETH_deposit = await contractWETH.balanceOf(address)
console.log(`存款后WETH持仓: ${ethers.utils.formatEther(balanceWETH_deposit)}\n`)
