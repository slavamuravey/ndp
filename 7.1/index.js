class ColorConsole {
    log(data) {}
}

class RedConsole extends ColorConsole {
    log(data) {
        console.log(`\x1b[31m${data}\x1b[0m`);
    }
}

class GreenConsole extends ColorConsole {
    log(data) {
        console.log(`\x1b[32m${data}\x1b[0m`);
    }
}

class BlueConsole extends ColorConsole {
    log(data) {
        console.log(`\x1b[34m${data}\x1b[0m`);
    }
}

function createColorConsole(color) {
    switch (color) {
    case 'red':
        return new RedConsole();
    case 'green':
        return new GreenConsole();
    case 'blue':
        return new BlueConsole();
    }

    throw new Error(`no implementation for the color: "${color}"`);
}

const consoleColorRed = createColorConsole('red');
consoleColorRed.log('red');
const consoleColorGreen = createColorConsole('green');
consoleColorGreen.log('green');
const consoleColorBlue = createColorConsole('blue');
consoleColorBlue.log('blue');
