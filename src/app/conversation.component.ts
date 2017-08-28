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

declare var $: any;
declare var html2canvas: any;

@Component({
  selector: 'conversation',
  templateUrl: 'conversation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConversationComponent {
  waitingForResponse: boolean = false;
  whiteSpace: string = 'pre';
  hideButtons: boolean = false;
  displayOutgoingMessage: boolean = false;
  form: FormGroup;
  conversation: Conversation;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute, private router: Router,
    private changeDetectorRef: ChangeDetectorRef, private http: Http,
    private ngRedux: NgRedux<IAppState>) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({});

    Common.loadConfigFile(this.ngRedux);
    Common.readVCAPCredentials(this.ngRedux, this.http);

    this.route.params.forEach(params => {
      let conversationId = params['id'];
      if (!conversationId) this.router.navigate(['/home']);
      else {
        this.conversation = this.ngRedux.getState().tool.conversations.find(x => x.id === conversationId);
      }
    });
  }

  ngAfterViewChecked() {
    if (this.conversation) {
      let log = this.conversation.logs.find(x => x.log_id === this.ngRedux.getState().tool.selectedLogId);
      if (!log) {
        log = this.conversation.logs[0];
      }
      this.displayMetaData(log, 'response');
    }

    if (this.getColumnWidth() > 445) {
      this.hideButtons = false;
    }
    else {
      this.hideButtons = true;
    }
  }

  getColumnWidth(): number {
    let output: number = 0;
    let elementButtonsConversation = document.getElementById('buttonsConversation');
    if (elementButtonsConversation) {
      output = elementButtonsConversation.scrollWidth;
    }
    return output;
  }

  downloadConversation() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(this.getConversation());
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "conversation.txt");
    exportElement.click();
  }

  downloadState() {
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(this.getState());
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "state.txt");
    exportElement.click();
  }

  downloadPayload() {
    let selectedLog = this.conversation.logs.find(x => x.log_id === this.ngRedux.getState().tool.selectedLogId);
    var href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedLog.request, null, 2));
    var exportElement = document.getElementById('exportElementHidden');
    exportElement.setAttribute("href", href);
    exportElement.setAttribute("download", "payload.json");
    exportElement.click();
  }

  copyConversationToClipboard() {
    this.copyToClipboard(this.getConversation());
  }

  getConversation(): string {
    let content: string = '';
    this.conversation.logs.forEach((log) => {
      content = content + 'User' + ': ' + log.request.input.text + '\n';
      content = content + 'Watson' + ': ' + log.response.output.text[0] + '\n';
    })
    return content;
  }

  copyStateToClipboard() {
    this.copyToClipboard(this.getState());
  }

  copyPayloadToClipboard() {
    let selectedLog = this.conversation.logs.find(x => x.log_id === this.ngRedux.getState().tool.selectedLogId);
    this.copyToClipboard(JSON.stringify(selectedLog.request, null, 2));
  }

  getState(): string {
    let content: string = 'No state information available yet';
    content = JSON.stringify(this.conversation.logs[this.conversation.logs.length - 1].response, null, 2);
    return content;
  }

  copyToClipboard(content: string) {
    let tempTextArea: HTMLTextAreaElement = document.createElement("textarea");
    tempTextArea.value = content;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.top = '0';
    tempTextArea.style.left = '0';
    tempTextArea.style.width = '1em';
    tempTextArea.style.height = '2em';
    tempTextArea.style.padding = '0';
    tempTextArea.style.border = 'none';
    tempTextArea.style.outline = 'none';
    tempTextArea.style.boxShadow = 'none';
    tempTextArea.style.background = 'transparent';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
    }
    document.body.removeChild(tempTextArea);
  }

  takeScreenshot(): void {
    let element = document.getElementById('chatWindow');

    html2canvas(element, {
      onrendered: function (canvas) {
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var exportElement = document.getElementById('exportElementHidden');
        exportElement.setAttribute("href", image);
        exportElement.setAttribute("download", "chat.png");
        exportElement.click();
      }
    });
  }

  getPayload(log): string {
    let output: string = 'The body will be displayed here.';
    if (log) {
      output = JSON.stringify(log.request, null, 2);
      output = output.trim();
    }
    return output;
  }

  getStateAll(log): string {
    let output: string = 'Session state will be displayed here.';
    if (log) {
      let state = log.response;
      output = JSON.stringify(state, null, 2);
      output = output.trim();
    }
    return output;
  }

  getStateIntent(log): string {
    let output: string = 'Intent information will be displayed here.';

    let intents: any = '[]'
    if (log) {
      intents = log.response.intents;
      output = JSON.stringify(intents, null, 2);
    }
    return output;
  }

  getStateEntities(log): string {
    let output: string = 'Entity information will be displayed here.';

    let entities: any = '[]'
    if (log) {
      entities = log.response.entities;
      output = JSON.stringify(entities, null, 2);
    }
    return output;
  }

  getStateOutput(log): string {
    let output: string = 'The text output will be displayed here.';

    let entities: any = '[]'
    if (log) {
      entities = log.response.output.text;
      output = JSON.stringify(entities, null, 2);
    }
    return output;
  }

  getStateContext(log): string {
    let output: string = 'The context will be displayed here.';
    let context: any = '{}'
    if (log) {
      context = log.response.context;
      output = JSON.stringify(context, null, 2);
    }
    return output;
  }

  getStateLogMessages(log): string {
    let output: string = 'The log messages will be displayed here.';
    let logMessages: any = '[]'
    if (log) {
      logMessages = log.response.output.log_messages;
      output = JSON.stringify(logMessages, null, 2);
    }
    return output;
  }

  displayPayload(log) {
    this.displayOutgoingMessage = true;
    this.displayMetaData(log, 'request');
  }

  onClickLogMessages(log) {
    this.ngRedux.dispatch({ type: ToolAction.SET_STATE_TYPE, payload: 'Log Messages' });
    let stateIdElement: any = document.getElementById('stateId');
    if (stateIdElement) {
      stateIdElement.value = "Log Messages";
    }
    this.displayMetaData(log, 'response');
  }

  onClickShowIntent(logId) {
    let log = this.conversation.logs.find(x => x.log_id === logId);
    this.ngRedux.dispatch({ type: ToolAction.SET_STATE_TYPE, payload: 'Intent' });
    let stateIdElement: any = document.getElementById('stateId');
    if (stateIdElement) {
      stateIdElement.value = "Intent";
    }
    this.displayMetaData(log, 'response');
  }

  displayMetaData(log, requestOrResponse: string) {
    let stateElement = document.getElementById('metaData');
    if (stateElement) {
      if (log && requestOrResponse) {
        if (this.ngRedux.getState().tool.selectedLogId != log.log_id) {
          this.ngRedux.dispatch({ type: ToolAction.SET_SELECTED_LOG, payload: { selectedLogId: log.log_id, selectedLogType: requestOrResponse } });
        }
      }
      if (log) {
        if (requestOrResponse == 'request') {
          this.displayOutgoingMessage = true;
          stateElement.innerHTML = this.getPayload(log);
        }
        if (requestOrResponse == 'response') {
          this.displayOutgoingMessage = false;
          let stateType = 'All';
          if (this.ngRedux.getState().tool) {
            stateType = this.ngRedux.getState().tool.stateType;
          }
          if (stateType === 'All') {
            stateElement.innerHTML = this.getStateAll(log);
          }
          if (stateType === 'Text Output') {
            stateElement.innerHTML = this.getStateOutput(log);
          }
          if (stateType === 'Intent') {
            stateElement.innerHTML = this.getStateIntent(log);
          }
          if (stateType === 'Entities') {
            stateElement.innerHTML = this.getStateEntities(log);
          }
          if (stateType === 'Context') {
            stateElement.innerHTML = this.getStateContext(log);
          }
          if (stateType === 'Log Messages') {
            stateElement.innerHTML = this.getStateLogMessages(log);
          }
        }
      }
      else {
        stateElement.innerHTML = this.getStateAll(log);
      }
      stateElement.scrollTop = 0;
    }
  }

  getAllMetaData(): string {
    let output: string = '';
    this.conversation.logs.forEach((log) => {
      output += JSON.stringify(log.response, null, 2);
    })
    output = output.trim();
    return output;
  }

  setWhiteSpace() {
    let stateType = 'All';
    if (this.ngRedux.getState().tool) {
      stateType = this.ngRedux.getState().tool.stateType;
    }
    this.whiteSpace = 'pre';
    if (stateType == 'Output Text') {
      this.whiteSpace = 'pre-wrap';
    }
  }

  getStateTypes(): string[] {
    let output = ['All', 'Log Messages', 'Intent', 'Entities', 'Context', 'Text Output'];
    let stateType = 'All';
    if (this.ngRedux.getState().tool) {
      stateType = this.ngRedux.getState().tool.stateType;
    }
    if (stateType == 'Output Text') {
      output = ['Output Text', 'All', 'Log Messages', 'Intent', 'Entities', 'Context'];
    }
    if (stateType == 'Entities') {
      output = ['Entities', 'All', 'Log Messages', 'Intent', 'Context', 'Text Output'];
    }
    if (stateType == 'All') {
      output = ['All', 'Log Messages', 'Intent', 'Entities', 'Context', 'Text Output'];
    }
    if (stateType == 'Context') {
      output = ['Context', 'All', 'Log Messages', 'Intent', 'Entities', 'Text Output'];
    }
    if (stateType == 'Log Messages') {
      output = ['Log Messages', 'All', 'Intent', 'Entities', 'Context', 'Text Output'];
    }
    return output;
  }

  stateTypeChanged(value) {
    this.ngRedux.dispatch({ type: ToolAction.SET_STATE_TYPE, payload: value });
    this.setWhiteSpace();
    let log = this.conversation.logs.find(x => x.log_id === this.ngRedux.getState().tool.selectedLogId);
    if (!log) {
      log = this.conversation.logs[0];
    }
    this.displayMetaData(log, 'response');
  }

  hasConversationLogMessages(): boolean {
    let output = false;
    let atLeastOneLog = 'false';
    this.conversation.logs.forEach((log) => {
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

  stringifyLogMessage(logMessage) {
    return JSON.stringify(logMessage);
  }

  hasConversationUnfulfilledIntents(): boolean {
    let output = false;
    let triggeredIntents = [];
    let fulfilledIntents = [];
    this.conversation.logs.forEach((log) => {
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

  getConversationUnfulfilledIntents(): string[] {
    let triggeredIntents = [];
    let fulfilledIntents = [];
    this.conversation.logs.forEach((log) => {
      if (log.response.output.intentTriggered) {
        triggeredIntents.push(log.response.output.intentTriggered);
      }
      if (log.response.output.intentFulfilled) {
        fulfilledIntents.push(log.response.output.intentFulfilled);
      }
    });
    fulfilledIntents.forEach((fulfilledIntent) => {
      try {
        let index = triggeredIntents.indexOf(fulfilledIntent, 0);
        if (index > -1) {
          triggeredIntents.splice(index, 1);
        }
      }
      catch (error) {
      }
    })
    return triggeredIntents;
  }

  getConversationOutOfScopePhrases(): string[] {
    let phrases = [];
    this.conversation.logs.forEach((log) => {
      if (log.response.output.outOfScope) {
        phrases.push(log.response.output.outOfScope);
      }
    });
    return phrases;
  }

  hasConversationOutOfScopeIntents(): boolean {
    let output = false;
    this.conversation.logs.forEach((log) => {
      if (log.response.output.outOfScope) {
        output = true;
      }
    });
    return output;
  }

  hasConversationUnconfidentIntents(): boolean {
    let output = false;
    this.conversation.logs.forEach((log) => {
      log.response.intents.forEach((intent) => {
        if (intent.confidence < 0.5) {
          output = true;
        }
      })
    });
    return output;
  }

  getConversationUnconfidentIntents() {
    let output = [];
    this.conversation.logs.forEach((log) => {
      log.response.intents.forEach((intent) => {
        if (intent.confidence < 0.5) {
          let element = { intent: intent.intent,
                          confidence: Math.round(intent.confidence * 100) / 100,
                          log_id: log.log_id,
                          userInput: log.request.input.text }
          output.push(element);
        }
      })
    });
    return output;
  }
}