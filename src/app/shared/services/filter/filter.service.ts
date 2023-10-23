import {Injectable} from '@angular/core';
import {World} from "../../models/World";
import {Story} from "../../models/Story";
import {OperationsService} from "../operations/operations.service";
import {Router} from "@angular/router";
import {Tag} from "../../models/Tag";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private lastSearchValue: string;
  private lastTags: Tag[];

  constructor(private operationsService: OperationsService, private router: Router) {
    this.lastSearchValue = '';
    this.lastTags = [];
    this._search = null;
    this._filters = null;
    this._tags = [];
    this._filterType = null;
    this._input = [];
    this._output = [];
    router.events.subscribe(() => {
      this.unselectAll();
      this._tags = [];
    });
  }

  private _input: (Story | World | any)[];

  get input(): (Story | World | any)[] {
    return this._input;
  }

  set input(value: (Story | World | any)[]) {
    this._input = value;
    this.sort();
  }

  private _output: (Story | World | any)[];

  get output(): (Story | World | any)[] {
    return this._output;
  }

  private _filters: 'name' | 'date' | 'selection' | null;

  get filters(): "name" | "date" | "selection" | null {
    return this._filters;
  }

  set filters(value: "name" | "date" | "selection" | null) {
    this._filters = value;
  }

  private _filterType: 'asc' | 'desc' | null;

  get filterType(): "asc" | "desc" | null {
    return this._filterType;
  }

  set filterType(value: "asc" | "desc" | null) {
    this._filterType = value;
    this.sort();
  }

  private _tags: Tag[];

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this._tags = value;
    this.sort();
    this.unselectAll();
  }

  private _search: string | null;

  get search(): string | null {
    return this._search;
  }

  set search(value: string | null) {
    this._search = value;
    this.sort();
  }

  addTag(tags: Tag[], id: string | number) {
    this._input = this._input.map((entry) => {
      if (entry.id === id) {
        entry.tags = tags;
        return entry;
      }
      return entry;
    })
    this.sort();
  }

  select(uid: string | number) {
    this.input = this.input.map((entry: World | Story | any) => {
      if (entry.id === uid) {
        if (entry instanceof Story) {
          this.operationsService.manageCrudEntry(entry.id, entry.name, 'story', !entry.selected);
          return new Story(entry.id, entry.name, entry.creationDate, entry.worldName, entry.worldId, entry.tags, !entry.selected);
        } else if (entry instanceof World) {
          this.operationsService.manageCrudEntry(entry.id, entry.name, 'world', !entry.selected);
          return new World(entry.id, entry.name, entry.creationDate, entry.tags, !entry.selected);
        } else {
          this.operationsService.manageCrudEntry(entry.id, entry.name, entry.type, !entry.selected);
          const changedEntry = entry;
          changedEntry.selected = entry.selected;
          return changedEntry;
        }
      }
      return entry;
    });
  }

  delete() {
    this.operationsService.delete();
  }

  unselectAll() {
    this.reSelectElements(true, false);
    this.sort();
  }

  selectAll() {
    this.reSelectElements(false, true);
    this.sort();
  }

  addTags(tags: Tag[]) {
    if (this._input) {
      this.input = this.input.map(item => {
        const entry = item;
        if (entry.selected) {
          tags.forEach(tag => {
            if (!entry.tags.some((entryTag: Tag) => entryTag.id === tag.id)) {
              entry.tags.push(tag);
            }
          });
          this.operationsService.addTags(this.getTypeOfEntry(entry), entry.id, entry.tags)
          return entry;
        }
        return entry;
      })
    }
  }

  sort() {
    if (this._tags !== this.lastTags) {
      this.reSelectElements(true, false);
      this.lastTags = this._tags;
    }
    this._output = this._input.slice(0);
    if (this._input) {
      if (this._filterType !== null) {
        this._output = this._output.sort((a: World | Story | any, b: World | Story | any) => {
          let comparison = 0;
          switch (this._filters) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'date':
              comparison = a.creationDate.getTime() - b.creationDate.getTime();
              break;
            case 'selection':
              if (a.selected && !b.selected) {
                comparison = -1;
              } else if (!a.selected && b.selected) {
                comparison = 1;
              }
              break;
          }
          return this._filterType == 'asc' ? comparison : -comparison;
        });
      }
    }
    if (this._search) {
      const searchTerm: string = this._search.toLowerCase();
      if (this.lastSearchValue !== searchTerm) {
        this.reSelectElements(true, false);
      }
      this._output = this._output.filter((item: World | Story | any) => {
        if (item instanceof World) {
          return item.name.toLowerCase().indexOf(searchTerm as string) > -1;
        } else if (item instanceof Story) {
          return (
            item.worldName.toLowerCase().indexOf(searchTerm as string) > -1 ||
            item.name.toLowerCase().indexOf(searchTerm as string) > -1
          );
        } else {
          return item.name.toLowerCase().indexOf(searchTerm as string) > -1
        }
        return true;
      });
      this.lastSearchValue = searchTerm;
    }
    if (this.isNotTagsPage() && this._tags.length > 0) {
      this._output = this._output.filter((item: World | Story | any) => {
        return this._tags.every((selectedTag: Tag) =>
          item.tags.some((tag: Tag) => selectedTag.id === tag.id)
        );
      });
    }
  }

  isNotTagsPage(): boolean {
    return this.operationsService.isNotTagsPage;
  }

  getTypeOfEntry(entry: World | Story | any) {
    if (entry instanceof World) {
      return 'world';
    } else if (entry instanceof Story) {
      return 'story';
    } else {
      return entry.type;
    }
  }

  private reSelectElements(unwanted: boolean, wanted: boolean) {
    this._input = this._input.map((entry: World | Story | any) => {
      if (this._output.some(value => value === entry)) {
        if (entry.selected == unwanted) {
          if (entry instanceof Story) {
            this.operationsService.manageCrudEntry(entry.id, entry.name, 'story', wanted);
            return new Story(entry.id, entry.name, entry.creationDate, entry.worldName, entry.worldId, entry.tags, wanted);
          } else if (entry instanceof World) {
            this.operationsService.manageCrudEntry(entry.id, entry.name, 'world', wanted);
            return new World(entry.id, entry.name, entry.creationDate, entry.tags, wanted);
          } else {
            this.operationsService.manageCrudEntry(entry.id, entry.name, entry.type, wanted);
            const changedEntry = entry;
            changedEntry.selected = wanted;
            return changedEntry;
          }
        }
        return entry;
      }
      return entry;
    });
  }

  changeSelection(uid: string | number, wanted: boolean){
    this._input.map(entry => {
      if(entry.id === uid){
        if(entry.selected === true){
          if (entry instanceof Story) {
            this.operationsService.manageCrudEntry(entry.id, entry.name, 'story', wanted);
            return new Story(entry.id, entry.name, entry.creationDate, entry.worldName, entry.worldId, entry.tags, wanted);
          } else if (entry instanceof World) {
            this.operationsService.manageCrudEntry(entry.id, entry.name, 'world', wanted);
            return new World(entry.id, entry.name, entry.creationDate, entry.tags, wanted);
          } else {
            this.operationsService.manageCrudEntry(entry.id, entry.name, entry.type, wanted);
            const changedEntry = entry;
            changedEntry.selected = wanted;
            return changedEntry;
          }
        }
      }
      return entry;
    })
    this.sort();
  }
}
