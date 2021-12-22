import { TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import Long from "long";



export function makeTxBodyBytes(msg, memo, timeoutheight) {
    const txBody = TxBody.fromPartial({
        messages: [msg],
        memo: memo,
        timeoutHeight: Long.fromNumber(timeoutheight),
        extensionOptions: [],
        nonCriticalExtensionOptions: [],
    })
    return TxBody.encode(txBody).finish()
}

export function makeRawTxBytes(authInfoBytes, bodyBytes, signatures) {
    const txRaw = TxRaw.fromPartial({
        authInfoBytes: authInfoBytes,
        bodyBytes: bodyBytes,
        signatures: signatures
    });
    return TxRaw.encode(txRaw).finish()
}

export function getTxBodyBytesForSend(sendMsg, memo, registry) {

    // const registry = new Registry()
    // let encodeObject =  {
    //   typeUrl: "/cosmos.tx.v1beta1.TxBody",
    //   value: {
    //     messages: [
    //       {
    //         typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    //         value: {
    //           fromAddress: fromAddress,
    //           toAddress: toAddress,
    //           amount: [
    //             {
    //               denom: process.env.NEXT_PUBLIC_DENOM,
    //               amount: amount,
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //     memo: memo,
    //   },
    // }
    // console.log("mmm")
    // console.log(encodeObject)
    // const ans = registry.encode(encodeObject)
    // return ans
    // const registry = new Registry();
    let txBodyFields = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: [
          sendMsg
        ],
        memo: memo,
      },
    };
    const txBodyBytes = registry.encode(txBodyFields);
    return txBodyBytes

  }