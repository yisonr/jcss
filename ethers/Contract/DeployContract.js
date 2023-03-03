/*
 *	部署智能合约
 *	在以太坊上, 智能合约的部署是一种特殊的交易: 将编译智能合约得到的字节码发送
 *	到0地址, 如果这个合约的构造函数有参数的话, 需要利用abi.encode将参数编码为
 *	字节码, 然后附在在合约字节码的尾部一起发送;
 *
 *  合约工厂
 *  ethers.js创造了合约工厂ContractFactory类型, 方便开发者部署合约; 可以利用
 *  合约abi编译得到的字节码bytecode和签名者变量signer来创建合约工厂实例, 
 *  为部署合约做准备
 *  const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
 *  如果合约的构造函数有参数, 必须在abi中包含构造函数
 *
 *
 *  在创建好合约工厂实例之后, 可以调用它的deploy函数并传入合约构造函数的参
 *  数args来部署并获得合约实例:
 *  const contract = await contractFactory.deploy(args)
 *
 *  await contractERC20.deployed()
 *  // 或者 await contract.deployTransaction.wait()
 *  
 */


import { ethers } from "ethers";

// 利用Infura的rpc节点连接以太坊网络
const INFURA_ID = '184d4c5ec78243c290d151d3f1a10f1d'
// 连接Rinkeby测试网
const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${INFURA_ID}`)

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// ERC20的人类可读abi
const abiERC20 = [
    "constructor(string memory name_, string memory symbol_)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function mint(uint amount) external",
];
// 填入合约字节码, 在remix中可以在两个地方找到Bytecode
// 1. 编译面板的Bytecode按钮
// 2. 文件面板artifact文件夹下与合约同名的json文件中
// 里面"bytecode"属性下的"object"字段对应的数据就是Bytecode
// "object": "608060405260646000553480156100...
const bytecodeERC20 = "" // 合约部署前如何获取? 还要使用 Remix 编译后获取吗


const factoryERC20 = new ethers.ContractFactory(abiERC20, bytecodeERC20, wallet);

// 1. 利用contractFactory部署ERC20代币合约
console.log("\n1. 利用contractFactory部署ERC20代币合约")
// 部署合约, 填入constructor的参数
const contractERC20 = await factoryERC20.deploy("WTF Token", "WTF") // TODO
console.log(`合约地址: ${contractERC20.address}`);
console.log("部署合约的交易详情")
console.log(contractERC20.deployTransaction)
console.log("\n等待合约部署上链")
await contractERC20.deployed()
console.log("合约已上链")

// 打印合约的name()和symbol(), 然后调用mint()函数给自己地址mint 10,000代币
console.log("\n2. 调用mint()函数, 给自己地址mint 10,000代币")
console.log(`合约名称: ${await contractERC20.name()}`)
console.log(`合约代号: ${await contractERC20.symbol()}`)
let tx = await contractERC20.mint("10000")
console.log("等待交易上链")
await tx.wait()
console.log(`mint后地址中代币余额: ${await contractERC20.balanceOf(wallet.address)}`)
console.log(`代币总供给: ${await contractERC20.totalSupply()}`)

// 3. 调用transfer()函数, 给V神转账1000代币
console.log("\n3. 调用transfer()函数，给V神转账1,000代币")
tx = await contractERC20.transfer("vitalik.eth", "1000")
console.log("等待交易上链")
await tx.wait()
console.log(`V神钱包中的代币余额: ${await contractERC20.balanceOf("vitalik.eth")}`)
