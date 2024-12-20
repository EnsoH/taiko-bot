export const dtxAbi = [
  {
    constant: false,
    inputs: [
      {
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        name: 'path',
        type: 'address[]',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'swapExactETHForTokens',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'amountIn',
        type: 'uint256',
      },
      {
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        name: 'path',
        type: 'address[]',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'swapExactTokensForETH',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
