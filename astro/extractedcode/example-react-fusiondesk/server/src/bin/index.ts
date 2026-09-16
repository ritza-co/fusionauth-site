#!/usr/bin/env node
import {CliCore} from "@tsed/cli-core";
import {config} from "../config"; // Import your application configuration
import {TicketSeedCommand} from './TicketSeedCommand';

CliCore.bootstrap({
  ...config,
  // add your custom commands here
  commands: [TicketSeedCommand]
}).catch(console.error);
