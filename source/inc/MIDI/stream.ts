
class Stream {
	pos: number;
	data: any;

	constructor (str: any) {
		this.pos = 0;
		this.data = str;
	}

	eof () {
		return this.pos >= this.data.length;
	}

	readInt32 () {
		const result = (
			(this.data[this.pos] << 24)
			+ (this.data[this.pos + 1] << 16)
			+ (this.data[this.pos + 2] << 8)
			+ this.data[this.pos + 3]
		);
		this.pos += 4;
		return result;
	}

	readInt16 () {
		const result = ((this.data[this.pos] << 8) + this.data[this.pos + 1]);
		this.pos += 2;
		return result;
	}

	readInt8 () {
		const result = this.data[this.pos];
		this.pos += 1;
		return result;
	}

	readVarInt () {
		let result = 0;
		while (true) {
			const b = this.readInt8();
			if (b & 0x80) {
				result += (b & 0x7f);
				result <<= 7;
			}
			else {
				return result + b;
			}
		}
	}

	read (length) {
		let result = this.data.slice(this.pos, this.pos + length);
		this.pos += length;
		return result;
	}

	readString (length) {
		let result = "";
		for (; length > 0; --length)
			result += String.fromCharCode(this.readInt8());
		return result;
	}
};



export default Stream;
