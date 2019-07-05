import { GroupByPipe } from './group-by.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [GroupByPipe],
    declarations: [GroupByPipe]
})
export class SharedPipesModule { }
