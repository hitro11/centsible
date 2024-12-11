import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnSelectImports } from '@spartan-ng/ui-select-brain';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { provideIcons } from '@ng-icons/core';
import {
    lucideBadgePlus,
    lucideTrash2,
    lucidePlusCircle,
} from '@ng-icons/lucide';
import {
    AMOUNT_REGEX,
    MAX_NUMBER_VALUE,
    STRING_REGEX,
} from '../../shared/constants';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { SetupAccountService } from '../services/setup-account.service';
import { deepCopy } from '../../shared/utils';
import {
    HlmCardContentDirective,
    HlmCardDescriptionDirective,
    HlmCardDirective,
} from '@spartan-ng/ui-card-helm';
import { ThemeService } from '../../shared/services/theme.service';
import { Expense } from '../models/AccountDetails';
import { noDuplicateNames } from '../../shared/validators';

@Component({
    selector: 'app-setup-expenses',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        HlmFormFieldModule,
        HlmInputDirective,
        BrnSelectImports,
        HlmSelectImports,
        HlmIconComponent,
        HlmButtonDirective,
        HlmCardContentDirective,
        HlmCardDescriptionDirective,
        HlmCardDirective,
    ],
    providers: [provideIcons({ lucideTrash2, lucidePlusCircle })],
    templateUrl: './setup-expenses.component.html',
    styleUrl: './setup-expenses.component.scss',
})
export class SetupExpensesComponent {
    updateSection = output<'previous' | 'next'>();

    fb = inject(FormBuilder);
    setupAccountService = inject(SetupAccountService);
    themeService = inject(ThemeService);
    maxCharacterLimit = 25;
    theme = this.themeService.getTheme();

    expenseNameValidators = [
        Validators.required,
        Validators.maxLength(this.maxCharacterLimit),
        Validators.pattern(STRING_REGEX),
    ];
    expenseAmountValidators = [
        Validators.required,
        Validators.max(MAX_NUMBER_VALUE),
        Validators.min(1),
        Validators.pattern(AMOUNT_REGEX),
    ];

    expensesData = deepCopy(this.setupAccountService.data.expenses) ?? [];

    form = this.fb.group({
        expenses: this.fb.array([]),
    });

    constructor() {
        for (const expense of this.expensesData) {
            this.addExpense(expense?.name, expense?.amount);
        }

        if (!this.expensesData.length) {
            this.addExpense();
        }
    }

    get expenses() {
        return this.form.controls['expenses'] as FormArray;
    }

    addExpense(name: string | null = null, amount: number | null = null) {
        const newExpense = this.fb.group({
            name: [name, this.expenseNameValidators],
            amount: [amount, this.expenseAmountValidators],
        });

        this.expenses?.push(newExpense);

        // reset formgroup to prevent 'required' error from activating on formcontrol creation
        newExpense.markAsPristine();
        newExpense.markAsUntouched();
        newExpense.updateValueAndValidity();
    }

    deleteExpense(index: number): void {
        this.expenses?.removeAt(index);
    }

    expenseNameUpdated() {
        const names: string[] = [];

        for (const control of this.expenses.controls) {
            const name = control.value.name;
            const nameFC = (control as FormGroup).controls['name'];

            if (names.includes(name)) {
                nameFC.setErrors({
                    duplicateName: true,
                });

                const i = names.findIndex((n) => n?.localeCompare(name) === 0);

                (this.expenses.at(i) as FormGroup).controls['name'].setErrors({
                    duplicateName: true,
                });
            } else {
                nameFC.updateValueAndValidity();
                nameFC.setErrors(nameFC.errors);
            }

            names.push(name);
        }
    }

    async updateSectionFn(direction: 'previous' | 'next') {
        if (this.form.valid) {
            const expenses: Expense[] = [];

            for (let i = 0; i < this.expenses.length; i++) {
                const name = this.expenses.at(i).value.name as string;
                const amount = parseInt(this.expenses.at(i).value.amount);
                expenses.push({ name, amount });
            }

            this.setupAccountService.data.expenses = expenses;
        }

        if (direction === 'next') {
            await this.setupAccountService.onSetupFormSubmit();
        } else {
            this.updateSection.emit(direction);
        }
    }
}
