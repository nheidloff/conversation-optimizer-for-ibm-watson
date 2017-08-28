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

import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SkillEditorStatusComponent } from './skill-editor-status.component';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './store';
import { ToolAction } from './store/tool.reducer';
import { Tool } from './store/tool';
import { Common } from './common';
import { ValidationError } from './store/validation-error';
import { Conversation } from './conversations';
import { MomentModule } from 'angular2-moment';

declare var $: any;

@Component({
  selector: 'conversations',
  templateUrl: 'conversations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConversationsComponent {

  form: FormGroup;
  @select(['tool', 'disabledUserInterface']) userInterfaceDisabled$: Observable<boolean>;
  @select(['tool', 'disabledUserInterfaceText']) userInterfaceDisabledText$: Observable<string>;
  @select(['tool', 'conversations']) conversations$: Observable<Conversation[]>;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute, private router: Router,
    private changeDetectorRef: ChangeDetectorRef, private http: Http,
    private ngRedux: NgRedux<IAppState>) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({});

    Common.loadConfigFile(this.ngRedux);
    Common.readVCAPCredentials(this.ngRedux, this.http);
  }

  hasConversationLogMessages(conversation: Conversation): boolean {
    let output = false;
    let atLeastOneLog = 'false';
    conversation.logs.forEach((log) => {
      if (log.response.output.log_messages) {
        if (log.response.output.log_messages.length > 0) {
          atLeastOneLog = 'true';
        }
      }
    });
    if (atLeastOneLog == 'true') {
      output = true
    }
    return output;
  }

  hasConversationUnfulfilledIntents(conversation: Conversation): boolean {
    let output = false;
    let triggeredIntents = [];
    let fulfilledIntents = [];
    conversation.logs.forEach((log) => {
      if (log.response.output.intentTriggered) {
        triggeredIntents.push(log.response.output.intentTriggered);
      }
      if (log.response.output.intentFulfilled) {
        fulfilledIntents.push(log.response.output.intentFulfilled);
      }
    });
    if (triggeredIntents.length > fulfilledIntents.length) {
      output = true
    }
    return output;
  }

  stringifyLogMessage(logMessage) {
    return JSON.stringify(logMessage);
  }

  onOpenConversation(id: string) {
    this.router.navigate(['/conversation/' + id]);
  }

  getWatsonConversationConfigStatus(): string {
    return this.ngRedux.getState().tool.watsonConversationConfigStatus;
  }

  getWatsonConversationLogsStatus(): string {
    return this.ngRedux.getState().tool.watsonConversationLogsStatus;
  }

  isWatsonConfigurationValid(): boolean {
    if ((this.ngRedux.getState().tool.watsonConversationConfigStatus == Tool.WATSON_CONVERSATION_CONFIG_STATUS_COMPLETE) ||
      (this.ngRedux.getState().tool.watsonConversationConfigStatus == Tool.WATSON_CONVERSATION_CONFIG_STATUS_VALIDATED)) {
      return true;
    }
    else {
      return false;
    }
  }

  readLogs(): void {
    Common.readLogs(this.ngRedux, this.http, (err) => {
    })
  }

  getLogs(): string {
    let output: string = '[\n';
    let l: number = this.ngRedux.getState().tool.logs.length;
    this.ngRedux.getState().tool.logs.forEach((log, index: number) => {
      if (index != 0) {
        output = output + '\n';
      }
      output = output + JSON.stringify(log, null, 2);
      if (index !== l - 1) {
        output = output + ',';
      }
    })
    output = output + '\n]';
    return output;
  }

  downloadConversations() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(this.getLogs());
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "logs.json");
    exportElement.click();
  }

  applyFilter(filter: string) {
    this.ngRedux.dispatch({ type: ToolAction.SET_FILTER, payload: filter });
  }

  getFilter(): string {
    return this.ngRedux.getState().tool.filter;
  }

  haveConversationsUnfulfilledIntents(): boolean {
    let output: boolean = false;
    this.ngRedux.getState().tool.conversations.forEach((conversation) => {
      if (this.hasConversationUnfulfilledIntents(conversation) == true) output = true;
    })
    return output;
  }

  haveConversationsLogMessages(): boolean {
    let output: boolean = false;
    this.ngRedux.getState().tool.conversations.forEach((conversation) => {
      if (this.hasConversationLogMessages(conversation) == true) output = true;
    })
    return output;
  }

  hasConversationOutOfScopeIntents(conversation: Conversation): boolean {
    let output = false;
    conversation.logs.forEach((log) => {
      if (log.response.output.outOfScope) {
        output = true;
      }
    });
    return output;
  }

  haveConversationsOutOfScopeIntents(): boolean {
    let output: boolean = false;
    this.ngRedux.getState().tool.conversations.forEach((conversation) => {
      if (this.hasConversationOutOfScopeIntents(conversation) == true) output = true;
    })
    return output;
  }

  hasConversationUnconfidentIntents(conversation: Conversation): boolean {
    let output = false;
    conversation.logs.forEach((log) => {
      if (log.response.intents) {
        log.response.intents.forEach((intent) => {
          if (intent.confidence < 0.5) {
            output = true;
          }
        })        
      }
    });
    return output;
  }

  haveConversationsUnconfidentIntents(): boolean {
    let output: boolean = false;
    this.ngRedux.getState().tool.conversations.forEach((conversation) => {
      if (this.hasConversationUnconfidentIntents(conversation) == true) output = true;
    })
    return output;
  }
}