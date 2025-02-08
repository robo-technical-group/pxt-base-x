// tests go here; this will not be compiled when this package is used as an extension.
let numberFailed: number = 0

/*
try {
    let _ = new BaseX.U8(0)
    game.splash("Zero constructor test 1 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(0)
    game.splash("Zero constructor test 2 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U8(1)
    game.splash("One constructor test 1 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(1)
    game.splash("One constructor test 2 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U8(64).decode([64,])
    game.splash("Big constructor test 1 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U8(200).decode([0xff,])
    game.splash("Big constructor test 2 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(64).decode([64,])
    game.splash("Big constructor test 3 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(30000).decode([0xffff,])
    game.splash("Big constructor test 4 failed.")
    numberFailed++
} catch { }
*/

function invert(coder: BaseX.RadixCoder, bytes: number[]): boolean {
    let result: number[] = coder.decode(coder.encode(bytes))
    if (result.length != bytes.length) {
        return false
    }
    for (let i: number = 0; i < result.length; i++) {
        if (result[i] != bytes[i]) {
            return false
        }
    }
    return true
}

function mCreateArray(length: number, value: number): number[] {
    let toReturn: number[] = []
    for (let i: number = 0; i < length; i++) {
        toReturn.push(value)
    }
    return toReturn
}

for (let u8: number = 2; u8 <= 256; u8++) {
    let coder: BaseX.U8 = new BaseX.U8(u8)
    for (let i: number = 0; i <= 65; i++) {
        if (!invert(coder, mCreateArray(i, 0))) {
            game.splash(`Zero filled test ${u8} pass ${i} failed.`)
            numberFailed++
        }
    }
}

if (numberFailed == 0) {
    game.splash("All tests passed!")
}