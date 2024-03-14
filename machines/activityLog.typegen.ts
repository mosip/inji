
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "loadActivities": "REFRESH" | "xstate.init";
"prependActivity": "STORE_RESPONSE";
"setActivities": "STORE_RESPONSE";
"storeActivity": "LOG_ACTIVITY";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "init" | "ready" | "ready.idle" | "ready.logging" | "ready.refreshing" | { "ready"?: "idle" | "logging" | "refreshing"; };
        tags: never;
      }
  