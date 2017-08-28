//------------------------------------------------------------------------------
// Copyright IBM Corp. 2017
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './store';
import * as config from '../assets/config.json';
import { ToolAction } from './store/tool.reducer';
import { Tool } from './store/tool';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ConversationsSDK } from './conversations';

export class Common {

    static loadConfigFile(ngRedux: NgRedux<IAppState>): void {
        if (ngRedux.getState().tool.configReadFromFile == false) {
            let configUser: string = config['username'];
            if (configUser) ngRedux.dispatch({ type: ToolAction.SET_WATSON_USER_NAME, payload: configUser });
            let configPassword: string = config['password'];
            ngRedux.dispatch({ type: ToolAction.SET_WATSON_USER_PASSWORD, payload: configPassword });
            let configWorkspace: string = config['workspaceId'];
            ngRedux.dispatch({ type: ToolAction.SET_WATSON_WORKSPACE, payload: configWorkspace });
            ngRedux.dispatch({ type: ToolAction.CONFIG_READ_FROM_FILE, payload: {} });
        }
    }

    static credentialsDefined(ngRedux: NgRedux<IAppState>, http: Http, callback: { (credentialsDefined: boolean): void; }) {
        let url = '/credentials';
        let errorMessage = 'Unexpected response from ' + url;
        let headers: Headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        http.get(url, options).subscribe(
            response => {
                try {
                    ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_READ, payload: {} });
                    let bodyString = response['_body'];
                    let body = JSON.parse(bodyString);
                    if (response.status == 200) {
                        if (body.hasCredentials) {
                            if (body.hasCredentials == true) {
                                ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: true });
                                callback(true);
                            }
                            else {
                                ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: false });
                                callback(false);
                            }
                        }
                        else {
                            ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: false });
                            callback(false);
                        }
                    }
                    else {
                        ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: false });
                        callback(false);
                    }
                } catch (error) {
                    ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: false });
                    callback(false);
                }
            },
            error => {
                ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: false });
                callback(false);
            }
        );
    }

    static readVCAPCredentials(ngRedux: NgRedux<IAppState>, http: Http) {
        if (ngRedux.getState().tool.vcapCredentialsRead == false) {
            Common.credentialsDefined(ngRedux, http, (credentialsExist: boolean) => {
                //ngRedux.dispatch({ type: ToolAction.SET_VCAP_CREDENTIALS_EXIST, payload: true });
            })
        }
    }

    static readLogs(ngRedux: NgRedux<IAppState>, http: Http, callback: { (err?: Error): void; }): void {
		ngRedux.dispatch({ type: ToolAction.RESET_CONVERSATION_LOGS, payload: { } });
		ngRedux.dispatch({ type: ToolAction.SET_USER_INTERFACE_DISABLED, payload: { disabled: true, text: 'Reading Conversation Logs' } });
		let workspaceId: string = ngRedux.getState().tool.watsonWorkspace;
		let watsonUrl = '/conversation/api/v1/workspaces/' + workspaceId + '/logs?version=2017-05-26&page_limit=100';		
		Common.readLogsPage(ngRedux, http, watsonUrl, (err) => {
			if (err) {
				console.log(err);
				ngRedux.dispatch({ type: ToolAction.SET_WATSON_CONVERSATION_CONFIG_STATUS, payload: Tool.WATSON_CONVERSATION_CONFIG_STATUS_INVALID});
			}
			ngRedux.dispatch({ type: ToolAction.SET_USER_INTERFACE_DISABLED, payload: { disabled: false, text: '' } });
			ngRedux.dispatch({ type: ToolAction.SET_WATSON_CONVERSATION_LOGS_STATUS, payload: Tool.WATSON_CONVERSATION_LOGS_STATUS_READ});
			ConversationsSDK.initialize(ngRedux);
            if (err) {
                callback(err);
            }
            else {
                callback();
            }
		});
	}

	static readLogsPage(ngRedux: NgRedux<IAppState>, http: Http, watsonUrl: string, callback: { (err?: Error): void; }): void {
		if (!watsonUrl) {
			callback();
		}
		else {
			this.readLogsList(ngRedux, http, watsonUrl, (errReadLogsList, conversationsReadLogsList, paginationReadLogsList) => {
				if (errReadLogsList) {
					callback(errReadLogsList);
				}
				else {
					ngRedux.dispatch({ type: ToolAction.ADD_CONVERSATION_LOGS, payload: conversationsReadLogsList });
					let morePages: boolean = false;
					if (paginationReadLogsList) {
						if (paginationReadLogsList.next_url) {
							morePages = true;
						}
					}	
					if (morePages == false) {
						callback();
					}
					else {
						Common.readLogsPage(ngRedux, http, '/conversation/api' + paginationReadLogsList.next_url, (error) => {
							if (error) {
								callback(error);
							}
							else {
								callback();
							}
						});
					}
				}
			});
		}
	}

	static readLogsList(ngRedux: NgRedux<IAppState>, http: Http, watsonUrl: string, callback: { (err: Error, conversations?: any, pagination?: any): void; }) {
		let username: string = ngRedux.getState().tool.watsonUserName;
		let password: string = ngRedux.getState().tool.watsonPassword;
		let errorMessage = 'Unexpected response from ' + watsonUrl;
		let watsonCredentials = "Basic " + new Buffer(username + ':' + password).toString('base64');
		let headers: Headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': watsonCredentials });
		let watsonOptions = new RequestOptions({ headers: headers });

		http.get(watsonUrl, watsonOptions).subscribe(
			response => {
				try {
					let bodyString = response['_body'];
					let body = JSON.parse(bodyString);
					if (response.status == 200) {
						callback(null, body.logs, body.pagination);
					}
					else {
						callback(new Error(errorMessage));
					}
				} catch (error) {
					callback(new Error(errorMessage));
				}
			},
			error => {
				callback(new Error(errorMessage));
			}
		);
	}
}