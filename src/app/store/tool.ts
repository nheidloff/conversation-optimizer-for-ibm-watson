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

import { ValidationError } from './validation-error';
import { Conversation } from '../conversations';

export class Tool {
  watsonUserName: string;
  watsonPassword: string;
  workspaceStatus: string;
  watsonWorkspace: string;
  validationErrors: ValidationError[];
  configReadFromFile: boolean;
  watsonConversationConfigStatus: string;
  watsonConversationLogsStatus: string;
  workspaces: any;
  vcapCredentialsRead: boolean;
  vcapCredentialsExist: boolean;
  logs: any[];
  disabledUserInterface: boolean;
  disabledUserInterfaceText: string;
  conversations: Conversation[];
  selectedLogId: string;
  selectedLogType: string;
  stateType: string;
  filter: string;

  static WATSON_CONVERSATION_CONFIG_STATUS_UNKNOWN: string = 'unknown';
  static WATSON_CONVERSATION_CONFIG_STATUS_INCOMPLETE: string = 'incomplete';
  static WATSON_CONVERSATION_CONFIG_STATUS_CREDENTIALS_SYNTACTICALLY: string = 'credentials-syntactially-correct';
  static WATSON_CONVERSATION_CONFIG_STATUS_COMPLETE: string = 'complete';
  static WATSON_CONVERSATION_CONFIG_STATUS_VALIDATED: string = 'validated';
  static WATSON_CONVERSATION_CONFIG_STATUS_INVALID: string = 'invalid';
  
  static WATSON_CONVERSATION_LOGS_STATUS_READ: string = 'logs-read';
  static WATSON_CONVERSATION_LOGS_STATUS_NOT_READ: string = 'logs-not-read';

  static FILTER_EVERYTHING = 'everything';
  static FILTER_OUT_OF_SCOPE_INTENTS = 'out-of-scope-intents';
  static FILTER_LOG_MESSAGES = 'log-messages';
  static FILTER_UNFULFILLED_INTENTS = 'unfulfilled-intents';
  static FILTER_UNCONFIDENT_INTENTS = 'unconfident-intents';
  
  constructor() {    
    this.watsonUserName = null;
    this.watsonPassword = null;
    this.validationErrors = [];
    this.configReadFromFile = false;
    this.watsonConversationConfigStatus = Tool.WATSON_CONVERSATION_CONFIG_STATUS_UNKNOWN;
    this.watsonConversationLogsStatus = Tool.WATSON_CONVERSATION_LOGS_STATUS_NOT_READ;
    this.watsonWorkspace = null;
    this.workspaces = [];
    this.vcapCredentialsRead = false;
    this.vcapCredentialsExist = false;
    this.logs = [];
    this.disabledUserInterface = false;
    this.disabledUserInterfaceText = '';
    this.conversations = [];
    this.selectedLogId = null;
    this.selectedLogType = null;
    this.stateType = 'All';
    this.filter = Tool.FILTER_EVERYTHING;
  }
}