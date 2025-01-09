import { HttpRequestBuilder } from './http-request-builder.js';

try {
    const res = await new HttpRequestBuilder()
        .setUrl('http://qwe:4321/t/y/u?a=1&b=2')
        .setBody('zxc')
        .setMethod('POST')
        .setHeaders({
            'My-header': 'asd'
        })
        .invoke();
} catch (e) {
    console.error('http request error', e);
}
