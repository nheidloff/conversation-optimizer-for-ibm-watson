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

import { SkillAction } from './action-types-skill';
import { DeepClone } from './deep-clone';
import { Skills } from './skills';
import { SkillsStatus } from '../status/status';
import { Tool } from './tool';
import { Validations } from './validations';

const INITIAL_TOOL_STATE: Tool = new Tool();

export function toolReducer(state: Tool = INITIAL_TOOL_STATE, action: any) {
    let newTool: Tool;
    newTool = DeepClone.cloneTool(state); 

    switch (action.type) {

        case ToolAction.SET_WATSON_USER_NAME:
            newTool.watsonUserName = action.payload;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_WATSON_USER_PASSWORD:
            newTool.watsonPassword = action.payload;            
            Validations.validate(newTool);
            return newTool;     
            
        case ToolAction.SET_WATSON_WORKSPACE:
            newTool.watsonWorkspace = action.payload;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.CONFIG_READ_FROM_FILE:
            newTool.configReadFromFile = true;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_WATSON_CONVERSATION_CONFIG_STATUS:
            newTool.watsonConversationConfigStatus = action.payload;
            return newTool;

        case ToolAction.SET_WATSON_CONVERSATION_LOGS_STATUS:
            newTool.watsonConversationLogsStatus = action.payload;
            return newTool;
        
        case ToolAction.SET_WORKSPACES:
            newTool.workspaces = action.payload;
            return newTool;

        case ToolAction.SET_VCAP_CREDENTIALS_READ:
            newTool.vcapCredentialsRead = true;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.SET_VCAP_CREDENTIALS_EXIST:
            newTool.vcapCredentialsExist = action.payload;
            Validations.validate(newTool);
            return newTool;

        case ToolAction.ADD_CONVERSATION_LOGS:
            action.payload.forEach((log) => {
                newTool.logs.push(log);
            })            
            return newTool;

        case ToolAction.RESET_CONVERSATION_LOGS:
            newTool.logs = [];
            return newTool;

        case ToolAction.SET_USER_INTERFACE_DISABLED:
            newTool.disabledUserInterface = action.payload.disabled;
            newTool.disabledUserInterfaceText = action.payload.text;
            return newTool;

        case ToolAction.SET_CONVERSATIONS:
            newTool.conversations = action.payload;
            return newTool;

        case ToolAction.SET_SELECTED_LOG:
            newTool.selectedLogId = action.payload.selectedLogId;
            newTool.selectedLogType = action.payload.selectedLogType;
            return newTool;

        case ToolAction.SET_STATE_TYPE:
            newTool.stateType = action.payload;
            return newTool;

        case ToolAction.SET_FILTER:
            newTool.filter = action.payload;
            return newTool;

        default:
            return state;
    }
}

export class ToolAction {
    static SET_WATSON_USER_NAME: string = 'SET_WATSON_USER_NAME';
    static SET_WATSON_USER_PASSWORD: string = 'SET_WATSON_USER_PASSWORD';
    static SET_WATSON_WORKSPACE: string = 'SET_WATSON_WORKSPACE';
    static CONFIG_READ_FROM_FILE: string = 'CONFIG_READ_FROM_FILE';
    static SET_WORKSPACES: string = 'SET_WORKSPACES';
    static SET_VCAP_CREDENTIALS_READ: string = 'SET_VCAP_CREDENTIALS_READ';
    static SET_VCAP_CREDENTIALS_EXIST: string = 'SET_VCAP_CREDENTIALS_EXIST';
    static ADD_CONVERSATION_LOGS: string = 'ADD_CONVERSATION_LOGS';
    static RESET_CONVERSATION_LOGS: string = 'RESET_CONVERSATION_LOGS';
    static SET_USER_INTERFACE_DISABLED: string = 'SET_USER_INTERFACE_DISABLED';
    static SET_WATSON_CONVERSATION_CONFIG_STATUS: string = 'SET_WATSON_CONVERSATION_CONFIG_STATUS';
    static SET_WATSON_CONVERSATION_LOGS_STATUS: string = 'SET_WATSON_CONVERSATION_LOGS_STATUS';
    static SET_CONVERSATIONS: string = 'SET_CONVERSATIONS';
    static SET_SELECTED_LOG: string = 'SET_SELECTED_LOG';
    static SET_STATE_TYPE: string = 'SET_STATE_TYPE';
    static SET_FILTER: string = 'SET_FILTER';
}