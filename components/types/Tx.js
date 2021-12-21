import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";


export function makeTxBodyBytes(msgs, memo, timeoutheight) {
    const txBody = TxBody.fromPartial({
        messages: msgs,
        memo: memo,
        timeoutHeight: Long.fromNumber(timeoutheight),
        extensionOptions: [],
        nonCriticalExtensionOptions: [],
    })
    return TxBody.encode(txBody).finish()
}
