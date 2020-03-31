
/* Wrapper for accessing strings through sequential writes */



module.exports = class OStream {
	constructor () {
		this.buffer = "";
	}

	write (str) {
		this.buffer += str;
	}

	/* write a big-endian 32-bit integer */
	writeInt32 (i) {
		this.buffer += String.fromCharCode((i >> 24) & 0xff) + String.fromCharCode((i >> 16) & 0xff) +
			String.fromCharCode((i >> 8) & 0xff) + String.fromCharCode(i & 0xff);
	}

	/* write a big-endian 16-bit integer */
	writeInt16 (i) {
		this.buffer += String.fromCharCode((i >> 8) & 0xff) + String.fromCharCode(i & 0xff);
	}

	/* write an 8-bit integer */
	writeInt8 (i) {
		this.buffer += String.fromCharCode(i & 0xff);
	}

	/* write a MIDI-style variable-length integer
		(big-endian value in groups of 7 bits,
		with top bit set to signify that another byte follows)
	*/
	writeVarInt (i) {
		if (i < 0)
			throw new Error("OStream.writeVarInt minus number: " + i);

		const b = i & 0x7f;
		i >>= 7;
		let str = String.fromCharCode(b);

		while (i) {
			const b = i & 0x7f;
			i >>= 7;
			str = String.fromCharCode(b | 0x80) + str;
		}

		this.buffer += str;
	}

	getBuffer () {
		return this.buffer;
	}

	getArrayBuffer () {
		return Uint8Array.from(this.buffer.split("").map(c => c.charCodeAt(0))).buffer;
	}
};
