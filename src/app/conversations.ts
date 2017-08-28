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
import { Tool } from './store/tool';
import { ToolAction } from './store/tool.reducer';

export class ConversationsSDK {

    static initialize(ngRedux: NgRedux<IAppState>): void {
        let conversations: Conversation[] = [];
        if (ngRedux.getState().tool.watsonConversationLogsStatus == Tool.WATSON_CONVERSATION_LOGS_STATUS_READ) {
            ngRedux.getState().tool.logs.forEach((log) => {
                let conversation: Conversation = ConversationsSDK.findConversation(conversations, log.response.context.conversation_id);
                if (!conversation) {
                    conversation = new Conversation();
                    conversation.id = log.response.context.conversation_id;
                    conversations.push(conversation);
                }
                let newLog = new Log();
                newLog.request = log.request;
                newLog.response = log.response;
                newLog.log_id = log.log_id;
                newLog.request_timestamp = log.request_timestamp;
                newLog.response_timestamp = log.response_timestamp;
                conversation.logs.push(newLog);
            });
            conversations.forEach((conversation) => {
                ConversationsSDK.addDateInformation(conversation);
            });
            conversations = ConversationsSDK.sortConversationsChronologically(conversations);
            ngRedux.dispatch({ type: ToolAction.SET_CONVERSATIONS, payload: conversations });
        }
    }

    static addDateInformation(conversation: Conversation): void {
        conversation.logs = ConversationsSDK.sortLogsChronologically(conversation.logs);
        if (conversation.logs.length > 0) {
            conversation.startDate = conversation.logs[0].request_timestamp;
            conversation.endDate = conversation.logs[conversation.logs.length - 1].response_timestamp;
            let startDate = new Date(conversation.startDate);
            let endDate = new Date(conversation.endDate);
            let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            conversation.duration = seconds;
        }
    }

    static sortLogsChronologically(logs: Log[]): Log[] {
        let output: Log[] = logs.sort((log1: Log, log2: Log) => {
            let date1 = new Date(log1.request_timestamp);
            let date2 = new Date(log2.request_timestamp);
            if (date1 > date2) {
                return 1;
            }
            if (date1 < date2) {
                return -1;
            }
            return 0;
        });
        return output;
    }

    static sortConversationsChronologically(conversations: Conversation[]): Conversation[] {
        let output: Conversation[] = conversations.sort((conversation1: Conversation, conversation2: Conversation) => {
            let date1 = new Date(conversation1.endDate);
            let date2 = new Date(conversation2.endDate);
            if (date1 > date2) {
                return -1;
            }
            if (date1 < date2) {
                return 1;
            }
            return 0;
        });
        return output;
    }

    static findConversation(conversations: Conversation[], conversationId: string) {
        let output: Conversation = null;
        conversations.forEach((conversation) => {
            if (conversation.id == conversationId) {
                output = conversation;
            }
        })
        return output;
    }
}

export class Conversation {
    id: string;
    logs: Log[];
    startDate: string;
    endDate: string;
    duration;

    constructor() {
        this.id = null;
        this.logs = [];
        this.duration = 0;
    }
}

export class Log {
    request: any;
    response: any;
    log_id: string;
    request_timestamp: string;
    response_timestamp: string;
}