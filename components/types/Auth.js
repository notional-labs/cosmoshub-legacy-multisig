import { Any } from "cosmjs-types/google/protobuf/any";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import Long from "long";
import {SignerInfo, AuthInfo} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  decodeTxRaw,
  DirectSecp256k1HdWallet,
  makeSignDoc,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import {
    encodeSecp256k1Pubkey,
    isMultisigThresholdPubkey,
    isSecp256k1Pubkey,
    MultisigThresholdPubkey,
    Pubkey,
    SinglePubkey,
  } from "@cosmjs/amino";

export function encodePubkey(pubkey) {
  console.log("test")
  console.log(fromBase64(pubkey.value))
    if (isSecp256k1Pubkey(pubkey)) {
      const pubkeyProto = PubKey.fromPartial({
        key: fromBase64(pubkey.value),
      });
      return Any.fromPartial({
        typeUrl: "/cosmos.crypto.ethsecp256k1.PubKey",
        value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
      });
    } else if (isMultisigThresholdPubkey(pubkey)) {
      const pubkeyProto = LegacyAminoPubKey.fromPartial({
        threshold: Uint53.fromString(pubkey.value.threshold).toNumber(),
        publicKeys: pubkey.value.pubkeys.map(encodePubkey),
      });
      return Any.fromPartial({
        typeUrl: "/cosmos.crypto.multisig.LegacyAminoPubKey",
        value: Uint8Array.from(LegacyAminoPubKey.encode(pubkeyProto).finish()),
      });
    } else {
      throw new Error(`Pubkey type ${pubkey.type} not recognized`);
    }
}

export function makePubKey (pubkeyBytes) {
    const pubkey = encodePubkey({
        type: "tendermint/PubKeySecp256k1",
        value: toBase64(pubkeyBytes),
    });
    return pubkey
}

export function makeEthPubkeyFromByte (pubkeyBytes) {
    return {
      typeUrl: "/cosmos.crypto.secp256k1.PubKey",
      value: pubkeyBytes,
    }
}

export function makeAuthInfoBytes (fee, pubkey, mode, sequence) {
    const signerInfo = SignerInfo.fromPartial({
        publicKey: pubkey,
        modeInfo: {
          single: {
            mode: mode ,
          },
        },
        sequence: Long.fromNumber(sequence),
    });

    const authInfo = AuthInfo.fromPartial({
        signerInfos: [signerInfo],
        fee: fee,
        
    })

    return AuthInfo.encode(authInfo).finish()
}