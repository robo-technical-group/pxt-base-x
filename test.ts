/*
let _buf: Buffer = Buffer.create(4)
_buf[0] = 0xffff
game.splash(_buf[0])
game.splash(_buf[1])
*/

let numberFailed: number = 0

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
    let _ = new BaseX.U8(0x101)
    game.splash("Big constructor test 1 failed.")
} catch { }

try {
    let _ = new BaseX.U16(0x10001)
    game.splash("Big constructor test 2 failed.")
} catch { }

try {
    let _ = new BaseX.U8(64).decode([64,])
    game.splash("Decode range test 1 failed.")
    numberFailed++
} catch { }
try {
    let _ = new BaseX.U8(200).decode([0xff,])
    game.splash("Decode range test 2 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(64).decode([64,])
    game.splash("Decode range test 3 failed.")
    numberFailed++
} catch { }

try {
    let _ = new BaseX.U16(30000).decode([0xffff,])
    game.splash("Decode range test 4 failed.")
    numberFailed++
} catch { }

function invert(coder: BaseX.U8, bytes: Buffer): boolean {
    let encoded: number[] = coder.encode(bytes)
    let result: Buffer = coder.decode(encoded)
    if (result.length != bytes.length) {
        console.log("Bytes:")
        console.log(bytes.toArray(NumberFormat.UInt8LE))
        console.log("Encoded:")
        console.log(encoded)
        console.log("Decoded:")
        console.log(result.toArray(NumberFormat.UInt8LE))
        game.splash("Length error.",
            `Result ${result.length} != Input ${bytes.length}.`)
        return false
    }
    for (let i: number = 0; i < result.length; i++) {
        if (result[i] != bytes[i]) {
            game.splash(`Match error @ ${i}.`,
                `Result ${result[i]} != Input ${bytes[i]}.`)
            return false
        }
    }
    return true
}

function invert2(coder: BaseX.U16, bytes: Buffer): boolean {
    let encoded: number[] = coder.encode(bytes)
    let result: Buffer = coder.decode(encoded)
    if (result.length != bytes.length) {
        console.log("Bytes:")
        console.log(bytes.toArray(NumberFormat.UInt8LE))
        console.log("Encoded:")
        console.log(encoded)
        console.log("Decoded:")
        console.log(result.toArray(NumberFormat.UInt8LE))
        game.splash("Length error.",
            `Result ${result.length} != Input ${bytes.length}.`)
        return false
    }
    for (let i: number = 0; i < result.length; i++) {
        if (result[i] != bytes[i]) {
            game.splash(`Match error @ ${i}.`,
                `Result ${result[i]} != Input ${bytes[i]}.`)
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
        let b: Buffer = Buffer.create(i)
        if (!invert(coder, b)) {
            game.splash(`Zero filled test ${u8} pass ${i} failed.`)
            numberFailed++
        }
        for (let j: number = 0; j < i; j++) {
            b[j] = randint(0, 0xf)
        }
        if (!invert(coder, b)) {
            game.splash(`Random filled test ${u8} pass ${i} failed.`)
            numberFailed++
        }
    }
}

for (let u16: number = 2; u16 <= 0x10000; u16 += 1 + randint(0, 200)) {
    let coder: BaseX.U16 = new BaseX.U16(u16)
    for (let i: number = 0; i <= 65; i++) {
        let b: Buffer = Buffer.create(i)
        if (!invert2(coder, b)) {
            game.splash(`Zero-filled test ${u16} pass ${i} failed.`)
            numberFailed++
        }
        for (let j: number = 0; j < i; j++) {
            b[j] = randint(0, 0xf)
        }
        if (!invert2(coder, b)) {
            game.splash(`Random-filled test ${u16} pass ${i} failed.`)
            numberFailed++
        }
    }
}

console.log("Done!")
if (numberFailed == 0) {
    game.splash("All tests passed!")
} else {
    game.splash(`${numberFailed} tests failed.`)
}