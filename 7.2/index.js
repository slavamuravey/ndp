import { HttpRequestBuilder } from './http-request-builder.js';

const httpRequestBuilder = new HttpRequestBuilder();
httpRequestBuilder
    .setUrl('http://qwe:4321/t/y/u?a=1&b=2')
    .setBody('zxc')
    .setMethod('POST')
    .setHeaders({
        'My-header': 'asd'
    });
try {
    const res = await httpRequestBuilder.invoke();
} catch (e) {
    console.error('http request error', e);
}
