/*
 * ERC721
 * ERC721是以太坊上流行的非同质化代币(NFT)标准, 在做NFT相关产品时, 需要筛选
 * 出符合ERC721标准的合约; 例如Opensea会自动识别ERC721, 并爬下它的名称、
 * 代号、metadata等数据用于展示;
 *
 * ERC165
 * 通过ERC165标准, 智能合约可以声明它支持的接口, 供其他合约检查; 因此可以
 * 通过ERC165来检查一个智能合约是不是支持了ERC721的接口;
 */

// IERC165接口合约只声明了一个supportsInterface函数
// interface IERC165 {
//    /**
//     * @dev 如果合约实现了查询的`interfaceId`，则返回true
//     * 规则详见：https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
//     *
//     */
//    function supportsInterface(bytes4 interfaceId) external view returns (bool);
// }
//
// ERC721合约中会实现IERC165接口合约的supportsInterface函数
// function supportsInterface(bytes4 interfaceId)
//       external
//       pure
//       override
// returns (bool)
// {
//       return
//           interfaceId == type(IERC721).interfaceId
// }
//

import { ethers } from "ethers";

//准备 alchemy API 
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

// 合约abi
const abiERC721 = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function supportsInterface(bytes4) public view returns(bool)",
];

// ERC721的合约地址(BAYC)
const addressBAYC = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
// 创建ERC721合约实例
const contractERC721 = new ethers.Contract(addressBAYC, abiERC721, provider)

// 1. 读取ERC721合约的链上信息
const nameERC721 = await contractERC721.name()
const symbolERC721 = await contractERC721.symbol()
console.log("1. 读取ERC721合约信息")
console.log(`合约地址: ${addressBAYC}`)
console.log(`名称: ${nameERC721}`)
console.log(`代号: ${symbolERC721}`)

// 2. 利用ERC165的supportsInterface, 确定合约是否为ERC721标准
// ERC721接口的ERC165 identifier
const selectorERC721 = "0x80ac58cd"
const isERC721 = await contractERC721.supportsInterface(selectorERC721)
console.log("\n2. 利用ERC165的supportsInterface, 确定合约是否为ERC721标准")
console.log(`合约是否为ERC721标准: ${isERC721}`)
