/*
 * 智能合约存储布局
 * 以太坊智能合约的存储是一个 uint256 -> uint256 的映射; uint256 大小为 32 bytes,
 * 这个固定大小的存储空间被称为 slot(插槽); 智能合约的数据就被存在一个个的 slot
 * 中, 从 slot 0 开始依次存储; 每个基本数据类型占一个slot, 例如uint, address 等
 * 等, 而数组和映射这类复杂结构则会更复杂; TODO: 熟练掌握以太坊智能合约存储布局
 * https://docs.soliditylang.org/en/v0.8.17/internals/layout_in_storage.html?highlight=Layout%20of%20State%20Variables%20in%20Storage
 *
 *
 * 以太坊所有数据都是公开的, 因此 private 变量并不私密; 即使是没有 getter 函
 * 数的 private 变量, 依然可以通过 slot 索引来读取它的值
 *
 *
 * ethersjs 提供了 getStorageAt() 方便开发者读取特定 slot 的值:
 * const value = await provider.getStorageAt(contractAddress, slot)
 * slot 为想读取变量的 slot 索引
 *
 */

// 读取任意数据脚本
// 利用 getStorageAt() 函数来读取 Arbitrum 跨链桥的合约所有者, 该跨链桥(TODO)
// 为可升级代理合约, 将 owner 存在了特定的 slot 避免发生变量碰撞, 并且没有读
// 取它的函数; 这里就可以利用getStorageAt() 来读取它
//
// 合约地址: 0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a
// slot索引: 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103
// (TODO: 如何获取 slot 索引)
//

import { ethers } from "ethers";

//准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

// 目标合约地址: Arbitrum ERC20 bridge（主网）
const addressBridge = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a' // DAI Contract
// 合约所有者 slot
const slot = `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`

const main = async () => {
    console.log("开始读取特定slot的数据")
    const privateData = await provider.getStorageAt(addressBridge, slot) 
    console.log("读出的数据（owner地址）: ", ethers.utils.getAddress(ethers.utils.hexDataSlice(privateData, 12)))
	// TODO: provider, utils 包的常用方法
}
main()
