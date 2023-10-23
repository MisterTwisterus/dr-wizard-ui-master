import {Routes} from '@angular/router';
import {WorldPage} from "./public/pages/world/world.page";
import {StoryPage} from "./public/pages/story/story.page";
import {PageNotFoundPage} from "./public/pages/page-not-found/page-not-found.page";
import {CharacterPage} from "./public/pages/character/character.page";
import {WorldEventPage} from "./public/pages/world-event/world-event.page";
import {TagsPage} from "./public/pages/tags/tags.page";
import {AuthorNotesPage} from "./public/pages/author-notes/author-notes.page";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/worlds',
    pathMatch: 'full'
  },
  {
    path: 'worlds',
    component: WorldPage
  },
  {
    path: 'stories',
    component: StoryPage
  },
  {
    path: 'characters',
    component: CharacterPage
  },
  {
    path: 'world-events',
    component: WorldEventPage
  },
  {
    path: 'tags',
    component: TagsPage
  },
  {
    path: 'author-notes',
    component: AuthorNotesPage
  },
  {
    path: '**',
    component: PageNotFoundPage,
    pathMatch: 'full'
  }
];
