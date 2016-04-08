/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "babel-polyfill";
import {start, Effects} from "reflex";
import * as UI from "./perspective-ui";
import {version} from "../package.json";
import * as Config from "../browserhtml.json";
import * as Runtime from "./common/runtime";
import {Renderer} from "driver";
import * as Devtools from "./devtools"

const isReload = window.application != null;

// If hotswap change address so it points to a new mailbox &r
// re-render.
if (isReload) {
  window.application.address(UI.LiveReload);
}

document.body.classList.toggle('use-native-titlebar',
                               Runtime.useNativeTitlebar());

const restore =
  () =>
  [ window.application.model.value
  , Effects.none
  ]


const application = start
  ( { flags:
      { Debuggee: UI
      , flags: void(0)
      }
    , init: Devtools.init
    , update: Devtools.update
    , view: Devtools.view
    }
  );



const renderer = new Renderer({target: document.body});
application.view.subscribe(renderer.address);

// Mozbrowser API has cerntain events that need to be handler with-in
// the same tick otherwise it's not going to work. To handle those events
// properly we use `Driver.force` effect that sends in special
// `{type: "Driver.Execute"}` action on which we force a render to run in
// the same tick.
application.task.subscribe(Effects.driver(action => {
  if (action.type === "Driver.Execute") {
    renderer.execute();
  } else {
    application.address(action);
  }
}));

window.application = application;