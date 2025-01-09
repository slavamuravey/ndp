import http from 'node:http';

export class HttpRequestBuilder {
    #url;
    #method;
    #headers;
    #body;

    setUrl(url) {
        this.#url = url;
        return this;
    }

    setMethod(method) {
        this.#method = method;
        return this;
    }

    setHeaders(headers) {
        this.#headers = headers;
        return this;
    }

    setBody(body) {
        this.#body = body;
        return this;
    }

    invoke() {
        return new Promise((resolve, reject) => {
            const options = [];
            if (this.#url != null) {
                options.push(this.#url);
            }
            options.push({
                method: this.#method,
                headers: this.#headers
            });
            const req = http.request(...options, (res) => resolve(res));
            req.on('error', (e) => reject(e));
            if (this.#body != null) {
                req.write(this.#body);
            }
            req.end();
        });
    }
}
