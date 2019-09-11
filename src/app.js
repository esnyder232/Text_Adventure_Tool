export class App {
  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'text-adventure-tool'], name: 'text-adventure-tool',      moduleId: 'text-adventure-tool',      nav: true, title: 'Text Adventure Tool' }
    ]);

    this.router = router;
  }
}
