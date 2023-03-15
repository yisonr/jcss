/*
 * 数字签名
 *
 * 在生产环境使用数字签名验证白名单发行NFT主要有以下步骤:
 * - 确定白名单列表
 * - 在后端维护一个签名钱包, 生成每个白名单对应的消息和签名
 * - 部署NFT合约, 并将签名钱包的公钥signer保存在合约中
 * - 用户铸造时, 向后端请求地址对应的签名
 * - 用户调用mint()函数进行铸造NFT
 */


import { ethers, utils } from "ethers";

import * as contractJson from "./contract.json" assert {type: "json"};
// TODO: 准备 contract.json 提供合约字节码

/* 打包消息
 * 在以太坊的ECDSA标准中, 被签名的消息是一组数据的keccak256哈希, 为bytes32类型;
 * 可以利用ethers.js提供的solidityKeccak256()函数, 把任何想要签名的内容打包并
 * 计算哈希, 等效于solidity中的keccak256(abi.encodePacked())
 */

// 1. 创建消息
const account = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
const tokenId = "0" // TODO: 0 tokenId 指?
// 等效于Solidity中的keccak256(abi.encodePacked(account, tokenId))
const msgHash = utils.solidityKeccak256(
    ['address', 'uint256'],
    [account, tokenId])
console.log(`msgHash：${msgHash}`)
// msgHash：0x1bf2c0ce4546651a1a2feb457b39d891a6b83931cc2454434f39961345ac378c

// 2. 签名: 为了避免用户误签了恶意交易, EIP191(TODO: 熟悉)提倡在消息前
// 加上"\x19Ethereum Signed Message:\n32"字符, 再做一次keccak256哈希得
// 到以太坊签名消息, 然后再签名; ethers.js的钱包类提供了signMessage()函
// 数进行符合EIP191标准的签名; 注意, 如果消息为string类型, 则需要利用
// arrayify()函数处理下(TODO:?)
const messageHashBytes = ethers.utils.arrayify(msgHash)
const signature = await wallet.signMessage(messageHashBytes);
console.log(`签名：${signature}`)
// 签名：0x390d704d7ab732ce034203599ee93dd5d3cb0d4d1d7c600ac11726659489773d559b12d220f99f41d17651b0c1c6a669d346a397f8541760d6b32a5725378b241c

// 3. 链下签名白名单铸造NFT
// 准备 alchemy API 
const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// 4. 创建合约工厂, 为部署NFT合约做准备
const abiNFT = [
    "constructor(string memory _name, string memory _symbol, address _signer)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function mint(address _account, uint256 _tokenId, bytes memory _signature) external",
    "function ownerOf(uint256) view returns (address)",
    "function balanceOf(address) view returns (uint256)",
];
// 合约字节码
const bytecodeNFT = contractJson.default.object;
const factoryNFT = new ethers.ContractFactory(abiNFT, bytecodeNFT, wallet);

// 5. 利用合约工厂部署NFT合约
// 部署合约, 填入constructor的参数
// TODO: 链上部署的合约的 name, symbol 可以重名吗?
const contractNFT = await factoryNFT.deploy("WTF Signature", "WTF", wallet.address)
console.log(`合约地址: ${contractNFT.address}`);
// console.log("部署合约的交易详情")
// console.log(contractNFT.deployTransaction)
console.log("等待合约部署上链")
await contractNFT.deployed()
// 也可以用 contractNFT.deployTransaction.wait()
console.log("合约已上链")

// 6. 调用NFT合约的mint()函数, 利用链下签名验证白名单, 为account地址铸造NFT
console.log(`NFT名称: ${await contractNFT.name()}`)
console.log(`NFT代号: ${await contractNFT.symbol()}`)
let tx = await contractNFT.mint(account, tokenId, signature) // TODO: 熟悉 mint 方法, 为什么 contractNFT 会有 mint 方法?
console.log("铸造中，等待交易上链")
await tx.wait()
console.log(`mint成功, 地址${account} 的NFT余额: ${await contractNFT.balanceOf(account)}\n`)

