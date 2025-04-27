namespace BaseX {
    function checkAscii(c: string): number {
        let toReturn: number = c.charCodeAt(0)
        if (toReturn >= (1 << 7)) {
            throw `Character ${c} cannot be encoded.`
        }
        return toReturn
    }

    export class AsciiRadixCoder {
        protected chars: Buffer
        protected digits: Buffer
        protected byteCoder: U8
        protected alpha: string = ""

        protected constructor(alphabet: String) {
            this.chars = Buffer.create(alphabet.length)
            this.digits = Buffer.create(1 << 7)
            this.digits.fill(0xff)
            for (let i: number = 0; i < alphabet.length; i++) {
                let c: number = checkAscii(alphabet.charAt(i))
                this.chars[i] = c
                if (this.digits[c] != 0xff) {
                    throw `Character '${alphabet.charAt(i)}' is repeated in alphabet.`
                }
                this.digits[c] = i
            }
            this.byteCoder = new U8(alphabet.length)
        }

        public get alphabet(): string {
            if (this.alpha !== null && this.alpha.length > 0) {
                return this.alpha
            }
            this.alpha = this.chars.toString()
            return this.alpha
        }

        public get base(): number {
            return this.chars.length
        }

        public static fromAlphabet(alphabet: string): AsciiRadixCoder {
            return new AsciiRadixCoder(alphabet)
        }

        public decode(s: string): Buffer {
            let bs: number[] = []
            for (let i: number = 0; i < s.length; i++) {
                let c: number = checkAscii(s.charAt(i))
                let digit: number = this.digits[c]
                if (digit == 0xff) {
                    throw `Character '${s.charAt(i)}' value ${c} is not present in the alphabet.`
                }
                bs.push(digit)
            }
            return this.byteCoder.decode(bs)
        }

        public encode(bytes: Buffer): string {
            let bs: number[] = this.byteCoder.encode(bytes)
            // console.log("Encoded number array:")
            // console.log(bs)
            let toReturn: string = ""
            bs.forEach((value: number, index: number) => {
                toReturn += String.fromCharCode(this.chars[value])
            })
            return toReturn
        }
    }
}