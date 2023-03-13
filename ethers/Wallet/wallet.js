/*
 *
 * HD 钱包
 * HD 钱包(Hierarchical Deterministic Wallet, 多层确定性钱包) 是一种数字钱包,
 * 通常用于存储比特币和以太坊等加密货币持有者的数字秘钥; 通过钱包, 用户可以从
 * 一个随机种子创建一系列秘钥对, 更加便利, 安全, 隐私;
 *
 * BIP32
 * 在BIP32推出之前, 用户需要记录一堆的私钥才能管理很多钱包; BIP32提出可以
 * 用一个随机种子衍生多个私钥, 更方便的管理多个钱包; 钱包的地址由衍生路径
 * 决定, 例如"m/0/0/1";
 *
 * BIP44
 * BIP44 为 BIP32 的衍生路径提供了一套通用规范, 适配比特币, 以太坊等多链;
 * 此套规范包含六级, 每级之间用"/"分割:
 * m / purpose' / coin_type' / account' / change / address_index
 * 其中:
 * - m: 固定为"m"
 * - purpose：固定为"44"
 * - coin_type：代币类型, 比特币主网为0, 比特币测试网为1, 以太坊主网为60
 * - account：账户索引, 从0开始
 * - change：是否为外部链, 0为外部链, 1为内部链, 一般填0.
 * - address_index：地址索引, 从0开始, 想生成新地址就把这里改为1, 2, 3
 * 举个例子, 以太坊的默认衍生路径为"m/44'/60'/0'/0/0" 
 * 
 * BIP39
 * BIP39让用户能以一些人类可记忆的助记词的方式保管私钥, 而不是一串16进制的数字
 *
 * TODO: 钱包, 助记词, 私钥, 公钥
 * 
 * 
 * 批量生成钱包
 * ethers.js 提供了 HDNode(https://docs.ethers.io/v5/api/utils/hdnode/)类, 方便
 * 开发者使用 HD 钱包
 *
 */

import { ethers } from "ethers";

// 生成随机助记词
const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(32))

// 创建HD钱包
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
console.log(hdNode);


// 通过HD钱包派生20个钱包
const numWallet = 20
// 派生路径: m / purpose' / coin_type' / account' / change / address_index
// 只需要切换最后一位address_index, 就可以从hdNode派生出新钱包
let basePath = "m/44'/60'/0'/0";
let wallets = [];
for (let i = 0; i < numWallet; i++) {
    let hdNodeNew = hdNode.derivePath(basePath + "/" + i); // TODO: 理解
    let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
    console.log(`第${i+1}个钱包地址:  ${walletNew.address}`)
    wallets.push(walletNew);
}


const wallet = ethers.Wallet.fromMnemonic(mnemonic)
console.log("通过助记词创建钱包:")
console.log(wallet)
// 加密json用的密码, 可以更改成别的
const pwd = "password"
const json = await wallet.encrypt(pwd)
console.log("钱包的加密json: ")
console.log(json)
