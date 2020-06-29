const request = new XMLHttpRequest();
request.open('GET', 'data.json');
request.responseType = 'json';
request.send();
request.onload = function() {
    const datajson = request.response;
    const img = new Image();
    img.src = datajson.file;
    const cycle_data = new Array(256);
    for (const cycle of datajson.cycles) {
        const start = Math.min(cycle[0], cycle[1]);
        const end = Math.max(cycle[0], cycle[1]);
        const delta = cycle[0] > cycle[1] ? 1 : -1;
        const length = end - start;
        // every 1/4 second, add cycle[2] to a counter, div by 0x1333 for number of steps
        const speed = cycle[2];
        for (var i = start; i <= end; i++) {
            cycle_data[i] = [start, length, delta, speed];
        }
    }
    console.log(cycle_data);

    img.onload = function() {
        const raw = document.createElement('canvas');
        raw.width = img.width;
        raw.height = img.height;
        raw.getContext('2d').drawImage(img, 0, 0);

        let start;
        function update(timestamp) {
            if (start === undefined) {
                start = timestamp;
            }
            const elapsed_ticks = (timestamp - start) / 1000 * 15;
            const imagedata = raw.getContext('2d').getImageData(0, 0, raw.width, raw.height);
            const data = imagedata.data;
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            for (var i = 0; i < data.length; i += 4) {
                var palette_index = data[i];
                if (cycle_data[palette_index] !== undefined) {
                    const start = cycle_data[palette_index][0];
                    const length = cycle_data[palette_index][1];
                    const delta = cycle_data[palette_index][2];
                    const speed = cycle_data[palette_index][3];
                    const num_steps = Math.floor(speed * elapsed_ticks / 0x1333);
                    palette_index = ((palette_index - start) + (num_steps * delta));
                    palette_index = ((palette_index % length) + length) % length;
                    palette_index += start;
                }
                const entry = datajson.palette[palette_index];
                data[i] = entry[0];
                data[i+1] = entry[1];
                data[i+2] = entry[2];
            }
            ctx.putImageData(imagedata, 0, 0);
            window.requestAnimationFrame(update);
        }
        window.requestAnimationFrame(update);
    }
}
