import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { createConnection } from './connections';
import { config } from './config';

const connection = createConnection(config.postgrest?.url);

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {
    connection,
  },
});

export default app;
