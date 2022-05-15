export interface ErrorResponse {
    message: string
    code: string
}

export enum ApiError {
    UNAUTHORIZED = "unauthorized",
    SERVER_ERROR = "server_error",
    OTHER = "other"
}

export interface ErrorDTO {
    type: ApiError
    message: string
    code: string | undefined
}

export default class Http {

    private static stringifyParameters(parameters: { [key: string]: string } | null): string {
        if (parameters == null) {
            return ''
        }
        let result = ''
        for (let i in parameters) {
            if (result !== '')
                result += '&'
            result += `${i}=${parameters[i]}`
        }
        result = (result === '' ? result : '?' + result)
        return result
    }

    private static createUrl(domain: string | null, endpoint: string, urlParameters: string | null): string {
        if (domain != null && domain.slice(-1) !== '/' && endpoint.slice(0, 1) !== '/') {
            domain += '/'
        }
        return (domain || '') + endpoint + (urlParameters || '')
    }

    private static handleHttpResult<T>(
        response: Response,
        onSuccess: (data: T) => void,
        onError: (error: ErrorDTO) => void) {
        console.log('[HTTP]', response);
        if (response.redirected || response.status === 302) {
            console.log('[HTTP] redirection');
        }

        response.text().then(function (text) {
            const status = response.status;
            if (status === 200) {
                const success: T = JSON.parse(text)
                onSuccess(success);
            } else {
                const error: ErrorResponse = JSON.parse(text)
                onError({
                    message: error.message,
                    code: error.code,
                    type: ApiError.SERVER_ERROR
                });
            }
        });
    }

    private static httpURL<T>(
        type: string,
        domain: string | null,
        endpoint: string,
        headers: { [key: string]: string },
        parameters: { [key: string]: string } | null,
        onSuccess: (data: T) => void,
        onError: (error: ErrorDTO) => void) {

        let urlParameters: string = this.stringifyParameters(parameters)
        let url: string = this.createUrl(domain, endpoint, urlParameters)
        console.log('[API_' + type + ']: ' + url)

        fetch(url, {
            method: type,
            headers: headers
        }).then(response => {
            this.handleHttpResult(response, onSuccess, onError)
        }).catch(error => {
            console.log('[API][ERROR]-->', error)
            onError({
                message: JSON.stringify(error.error),
                code: undefined,
                type: ApiError.OTHER
            });
        })
    }

    private static httpData<T>(
        type: string,
        domain: string | null,
        endpoint: string,
        headers: { [key: string]: string },
        data: BodyInit,
        onSuccess: (data: T) => void,
        onError: (error: ErrorDTO) => void) {

        let url: string = this.createUrl(domain, endpoint, null)

        console.log('[API_' + type + ']: ' + url)
        fetch(url, {
            method: type,
            headers: headers,
            body: data
        }).then(response => {
            this.handleHttpResult(response, onSuccess, onError)
        }).catch(error => {
            console.log('[API][ERROR]-->', error)
            onError({
                message: error.error,
                code: undefined,
                type: ApiError.OTHER
            });
        })
    }

    static get<T>(domain: string | null, endpoint: string, token: string | null, parameters: {}, onSuccess: (data: T) => void, onError: (error: ErrorDTO) => void) {
        let headers: { [key: string]: string } = {}
        headers['Access-Control-Allow-Origin'] = '*'
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        this.httpURL('GET', domain, endpoint, headers, parameters, onSuccess, onError)
    }

    static post<T>(domain: string | null, endpoint: string, token: string | null, data: {}, onSuccess: (data: T) => void, onError: (error: ErrorDTO) => void) {
        let headers: { [key: string]: string } = {}
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        this.httpData('POST', domain, endpoint, headers, JSON.stringify(data), onSuccess, onError)
    }

    static put<T>(domain: string | null, endpoint: string, token: string | null, data: {}, onSuccess: (data: T) => void, onError: (error: ErrorDTO) => void) {
        let headers: { [key: string]: string } = {}
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        this.httpData('PUT', domain, endpoint, headers, JSON.stringify(data), onSuccess, onError)
    }

    static delete<T>(domain: string | null, endpoint: string, token: string | null, data: {}, onSuccess: (data: T) => void, onError: (error: ErrorDTO) => void) {
        let headers: { [key: string]: string } = {}
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        this.httpData('DELETE', domain, endpoint, headers, JSON.stringify(data), onSuccess, onError)
    }
}