class OStream {
	data: number[];

	constructor () {
		this.data = [];
	}

	write (str) {
		for (let i = 0; i < str.length; ++i)
			this.data.push(str.charCodeAt(i));
	}

	writeInt32 (value) {
		this.data.push((value >> 24) & 0xff);
		this.data.push((value >> 16) & 0xff);
		this.data.push((value >> 8) & 0xff);
		this.data.push(value & 0xff);
	}

	writeInt16 (value) {
		this.data.push((value >> 8) & 0xff);
		this.data.push(value & 0xff);
	}

	writeInt8 (value) {
		this.data.push(value & 0xff);
	}

	writeVarInt (value) {
		const stack = [];
		while (value) {
			stack.push(value & 0x7f);
			value >>= 7;
		}

		for (let i = stack.length - 1; i >= 0; --i)
			this.data.push(stack[i] | (i ? 0x80 : 0));
	}

	buffer () {
		return new Uint8Array(this.data);
	}
}

export default OStream;
