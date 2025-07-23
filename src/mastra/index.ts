
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import {Memory} from '@mastra/memory';
import {recallAgent } from './agents/recall-agent';
import  {recallWorkflow} from './workflows/recall-workflow';  

// const memory = new Memory({
//   storage: new LibSQLStore({
//     url :"file:../mastra.db", // Change to your desired file path
//   }),
// });

export const mastra = new Mastra({
  workflows: { recallWorkflow },
  agents: { recallAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: "file:../mastra.db",
    // url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
