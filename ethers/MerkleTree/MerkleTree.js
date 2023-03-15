/*
 * Merkle Tree
 * 默克尔树或哈希树, 是一种自下而上构建的加密树, 每个叶子对应数据的
 * 哈希, 而每个非叶子为它的2个子结点的哈希
 *
 * Merkle Tree 允许对大型数据结构的内容进行有效和安全的验证(Merkle 
 * Proof), 对于有N个叶子结点的 Merkle Tree 非常高效; 
 *
 * MerkleTree.js 是构建 Merkle Tree 和 Merkle Proof 的js包(
 * https://github.com/miguelmota/merkletreejs), 可使用 npm 安装
 * 
 *
 * 在生产环境使用Merkle Tree验证白名单发行NFT主要有以下步骤: TODO: 熟练掌握
 * - 在后端生成白名单列表的Merkle Tree
 * - 部署NFT合约, 并将Merkle Tree的root保存在合约中
 * - 用户铸造时, 向后端请求地址对应的proof
 * - 用户调用mint()函数进行铸造NFT
 */

// Merkle Tree白名单铸造NFT
import { ethers, utils } from "ethers";
import { MerkleTree } from "merkletreejs";

import * as contractJson from "./contract.json" assert {type: "json"};
// TODO: 准备 contract.json


// 1. 创建白名单地址数组
// 白名单地址
const tokens = [
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"
];

// 2. 将数据进行keccak256哈希(与solidity使用的哈希函数匹配), 创建叶子结点
const leaf = tokens.map(x => utils.keccak256(x))

// 3. 创建Merkle Tree, 哈希函数仍然选择keccak256, 可选参数sortPairs:
// true(constructor函数文档), 与Merkle Tree合约处理方式保持一致
const merkletree = new MerkleTree(leaf, utils.keccak256, { sortPairs: true })

// 4. 获得Merkle Tree的root
const root = merkletree.getHexRoot()

// 5. 获得第0个叶子节点的proof
const proof = merkletree.getHexProof(leaf[0]);

console.log("Leaf:")
console.log(leaf)
console.log("\nMerkleTree:")
console.log(merkletree.toString())
console.log("\nProof:")
console.log(proof)
console.log("\nRoot:")
console.log(root)


// 6. 创建provider和wallet
// 准备 alchemy API
const ALCHEMY_GOERLI_URL = 'https://eth-goerli.alchemyapi.io/v2/GlaeWuylnNM3uuOo-SAwJxuwTdqHaY5l';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// 7. 创建合约工厂, 为部署合约做准备
// NFT的abi
const abiNFT = [
    "constructor(string memory name, string memory symbol, bytes32 merkleroot)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function mint(address account, uint256 tokenId, bytes32[] calldata proof) external",
    "function ownerOf(uint256) view returns (address)",
    "function balanceOf(address) view returns (uint256)",
];
// 合约字节码, 在remix中两个地方可以找到Bytecode
// i. 部署面板的Bytecode按钮
// ii. 文件面板artifact文件夹下与合约同名的json文件中
// 里面"object"字段对应的数据就是Bytecode, 挺长的，608060起始
// "object": "608060405260646000553480156100...
const bytecodeNFT = contractJson.default.object;
const factoryNFT = new ethers.ContractFactory(abiNFT, bytecodeNFT, wallet);

// 8. 利用contractFactory部署NFT合约
console.log("\n2. 利用contractFactory部署NFT合约")
// 部署合约, 填入constructor的参数
const contractNFT = await factoryNFT.deploy("WTF Merkle Tree", "WTF", root)
console.log(`合约地址: ${contractNFT.address}`);
// console.log("部署合约的交易详情")
// console.log(contractNFT.deployTransaction)
console.log("等待合约部署上链")
await contractNFT.deployed()
// 也可以用 contractNFT.deployTransaction.wait()
console.log("合约已上链")

// 9. 调用mint()函数, 利用merkle tree验证白名单, 并给第0个地址铸造NFT;
// 在mint成功后可以看到NFT余额变为1
console.log("\n3. 调用mint()函数, 利用merkle tree验证白名单, 给第一个地址铸造NFT")
console.log(`NFT名称: ${await contractNFT.name()}`)
console.log(`NFT代号: ${await contractNFT.symbol()}`)
let tx = await contractNFT.mint(tokens[0], "0", proof)
console.log("铸造中，等待交易上链")
await tx.wait()
console.log(`mint成功，地址${tokens[0]} 的NFT余额: ${await contractNFT.balanceOf(tokens[0])}\n`)


