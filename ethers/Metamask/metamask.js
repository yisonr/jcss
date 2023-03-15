/*
 * 连接metamask
 * 在安装好metamask钱包后, 浏览器会给每个页面注入一个window.ethereum对象, 
 * 用于和钱包交互; ethers.js提供的 Web3Provider 封装了一个标准的 Web3 Provider, 
 * 直接在程序中生成一个provider对象, 方便使用:
 * // 获得provider
 * const provider = new ethers.providers.Web3Provider(window.ethereum)
 *
 *
 * 在 ./index.html 中嵌入以下 javascript 脚本
 *
 * 在本地运行 index.html 时, 需要安装http-server包:
 * npm install --global http-server
 * 然后运行: 
 * http-server . 
 */

// 1. 引入 ethers.js 包, 获取页面中的按钮和文本变量, 给按钮加一个监听器, 
// 被点击时会触发 onClickHandler() 函数
import { ethers } from "https://cdn-cors.ethers.io/lib/ethers-5.6.9.esm.min.js";
const ethereumButton = document.querySelector('.connect');
const showAccount = document.querySelector('.showAccount');
const showChainID = document.querySelector('.showChainID');
const showETHBalance = document.querySelector('.showETHBalance');

ethereumButton.addEventListener(`click`, onClickHandler)


// onClickHandler() 函数连接metamask, 开始与钱包交互
async function onClickHandler() {
	// 获得provider
	const provider = new ethers.providers.Web3Provider(window.ethereum)
	
	// 读取钱包地址
	const accounts = await provider.send("eth_requestAccounts", []);
	const account = accounts[0]
	console.log(`钱包地址: ${account}`)
	showAccount.innerHTML = account;
	
	// 读取chainid
	const { chainId } = await provider.getNetwork()
	console.log(`chainid: ${chainId}`)
	showChainID.innerHTML = chainId
	
	// 读取ETH余额
	const signer = provider.getSigner()
	const balance = await provider.getBalance(signer.getAddress());
	console.log(`以太坊余额： ${ethers.utils.formatUnits(balance)}`)
	showETHBalance.innerHTML = ethers.utils.formatUnits(balance);
}
