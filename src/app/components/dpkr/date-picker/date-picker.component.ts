import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('cally') calendar: ElementRef;
  @ViewChild('callyinp') calendarInput: ElementRef;
  @ViewChild('callyicon') calendarIcon: ElementRef;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  constructor(private window: Window) {}

  // To detect any outside click to toggle or close the calendar accordingly
  @HostListener('document:click', ['$event'])
  clickedOutside(event) {
    if (this.disabled == true) return;
    else if (this.calendarInput?.nativeElement.contains(event.target)) {
      this.show = !this.show;
      if (this.show == true) {
        // to display the selected date after dropdown is re-opened
        if (this.displayDate != null) {
          this.renderSelectedDate();
        }
      }
    }
    // Do not close the calendar if user clicks anywhere inside calendar
    else if (this.calendar?.nativeElement.contains(event.target)) {
      this.show = true;
    } else {
      // Close the calendar if user clicks anywhere outside calendar/calendar input
      this.show = false;
    }
  }

  //  To detect where to render (upside/downside) the calendar based on spacing
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.dropUpOrDown();
  }

  years = [];
  months = [
    { id: 0, val: 'Jan' },
    { id: 1, val: 'Feb' },
    { id: 2, val: 'Mar' },
    { id: 3, val: 'Apr' },
    { id: 4, val: 'May' },
    { id: 5, val: 'Jun' },
    { id: 6, val: 'Jul' },
    { id: 7, val: 'Aug' },
    { id: 8, val: 'Sep' },
    { id: 9, val: 'Oct' },
    { id: 10, val: 'Nov' },
    { id: 11, val: 'Dec' },
  ];

  date: any = new Date();
  show: boolean = false;
  days: any[] = [];
  lastDayofCurrentMonth: any;
  lastDayofPrevMonth: any;
  firstDayIndex: any;
  lastDayIndex: any;
  nextDays: any;
  // Display on input box
  displayDate: any = null;
  minDate: any = null;
  maxDate: any = null;

  leftIconDisabled: boolean;
  rightIconDisabled: boolean;
  currentDateOrignal: any;

  @Input() min = null;
  @Input() max = null;
  @Input() disabled: boolean = false;
  @Input() selectedValue: any = null;
  @Input() placeholder: string = 'Select Date';
  @Output() SelectedDate = new EventEmitter<any>();

  ngOnInit(): void {
    this.yearAssigner();
    let todaysDate = new Date().setHours(0, 0, 0, 0);
    this.currentDateOrignal = new Date(todaysDate);

    this.date.setDate(1);
    this.date.setHours(0, 0, 0, 0);
    this.selectedYear = this.date.getFullYear();
    this.selectedMonth = this.date.getMonth();

    if (this.min != null) {
      let d = new Date(this.min).setHours(0, 0, 0, 0);
      this.minDate = new Date(d);
    }

    if (this.max != null) {
      let d = new Date(this.max).setHours(0, 0, 0, 0);
      this.maxDate = new Date(d);
      this.date.setYear(this.maxDate.getFullYear());
      this.selectedYear = this.maxDate.getFullYear();
      this.date.setMonth(this.maxDate.getMonth());
      this.selectedMonth = this.maxDate.getMonth();
    }
    if (this?.selectedValue) {
      this.setDisplayDateAccordingtoInput();
    }
    // Index of day of the first-date
    this.firstDayIndex = this.date.getDay();
    this.configureAndRenderCalendar();
  }

  ngAfterViewInit(): void {
    this.dropUpOrDown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.min = null;
    this.max = null;
    if (changes?.['min']?.currentValue) {
      this.min = `${changes?.['min'].currentValue}`;
    }
    if (changes?.['max']?.currentValue) {
      this.max = `${changes?.['max'].currentValue}`;
    }
    if (changes?.['selectedValue']?.currentValue) {
      let selectedDate = new Date(`${changes?.['selectedValue'].currentValue}`);
      selectedDate.setHours(0, 0, 0, 0);
      this.selectedValue = selectedDate;
    }
    else{
      this.displayDate=null;
    }
    if (
      changes?.['min']?.currentValue ||
      changes?.['max']?.currentValue ||
      changes?.['selectedValue']?.currentValue
    )
      this.ngOnInit();
  }

  configureAndRenderCalendar() {
    this.days = [];
    this.lastDayofCurrentMonth = 0;
    this.lastDayofPrevMonth = 0;
    this.lastDayIndex = 0;
    this.nextDays = 0;

    this.lastDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDay();

    //days of next month to be displayed
    this.nextDays = 7 - this.lastDayIndex - 1;

    this.lastDayofCurrentMonth = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();

    this.lastDayofPrevMonth = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      0
    ).getDate();

    // Previous month dates (Dates like 29,30,31,1)
    for (let x = this.firstDayIndex - 1; x >= 0; x--) {
      this.days.push({
        day: this.lastDayofPrevMonth - x,
        type: 'prev',
        disabled: true,
      });
    }

    //  Setting Current month dates (1-30 / 1-31)
    let disabled;
    for (let i = 1; i <= this.lastDayofCurrentMonth; i++) {
      disabled = false;

      // Check if mindate lies between these dates
      if (this?.minDate) {
        if (this.checkIfDateisEqualtoMinDate(i)) this.leftIconDisabled = true;

        if (this.checkIfDateisLessThanMinDate(i)) {
          this.leftIconDisabled = true;
          disabled = true;
        }
      }
      // Check if maxdate lies between these dates
      if (this?.maxDate) {
        if (this.checkIfDateisEqualtoMaxDate(i)) this.rightIconDisabled = true;

        if (this.checkIfDateisGreaterThanMaxDate(i)) {
          this.rightIconDisabled = true;
          disabled = true;
        }
      }

      // To highlight the selected date
      if (
        i == this?.displayDate?.getDate() &&
        this?.displayDate?.getMonth() == this.date.getMonth() &&
        this?.displayDate?.getFullYear() == this.date.getFullYear()
      ) {
        this.days.push({ day: i, type: 'target', disabled: disabled });
      } else {
        this.days.push({ day: i, type: 'curr', disabled: disabled });
      }
    }

    // Number of next days to be displayed
    if (this.nextDays <= 2) {
      this.nextDays += 3;
    }

    // Dates of next month
    for (let j = 1; j <= this.nextDays; j++) {
      this.days.push({ day: j, type: 'next', disabled: true });
    }
  }

  // Toggle calendar on icon click
  calendarClick() {
    this.show = !this.show;
  }

  //  If left arrow is clicked
  prevArrow() {
    // Do not allow if disabled
    if (this.leftIconDisabled) return;

    // Reset
    this.leftIconDisabled = false;
    this.rightIconDisabled = false;

    this.date.setMonth(this.date.getMonth() - 1);
    this.selectedYear = this.date.getFullYear();

    // If calendar is finished (first month and first year of calendar)
    this.checkIfCalendarisFinished(this.date.getMonth(), this.selectedYear);

    this.date.setDate(1);

    this.firstDayIndex = this.date.getDay();
    this.configureAndRenderCalendar();
  }

  // If right arrow is clicked
  nextArrow() {
    // Do not allow if disabled
    if (this.rightIconDisabled) return;
    // Reset
    this.leftIconDisabled = false;
    this.rightIconDisabled = false;
    this.date.setMonth(this.date.getMonth() + 1);
    this.selectedYear = this.date.getFullYear();
    // If calendar is finished (last month and last year of calendar)
    this.checkIfCalendarisFinished(this.date.getMonth(), this.selectedYear);

    this.date.setDate(1);
    this.firstDayIndex = this.date.getDay();
    this.configureAndRenderCalendar();
  }

  selectedDay;
  selectedMonth;
  selectedYear;
  dateClicked(val) {
    // If date is not disabled
    if ((val.type == 'curr' || val.type == 'target') && !val.disabled) {
      this.show = false;
      let day = val.day;
      let month = this.date.getMonth();
      let year = this.date.getFullYear();

      this.selectedDay = day;
      this.selectedMonth = month;
      this.selectedYear = year;

      this.date = new Date(year, month, day);
      this.displayDate = new Date(year, month, day);
      this.SelectedDate.emit(this.displayDate);
      this.configureAndRenderCalendar();
    }
  }

  // Year is changed
  yearSelected(e) {
    this.leftIconDisabled = false;
    this.rightIconDisabled = false;
    let y = e.target.value;
    this.date.setYear(y);
    this.selectedYear = this.date.getFullYear();

    this.date.setDate(1);
    // Disable leftIcon/RightIcon if calendar is finished
    this.checkIfCalendarisFinished(this.date.getMonth(), this.selectedYear);
    // To Display and render correct month in case mindate and/or maxdate is set
    if (
      this?.minDate?.getFullYear() == this.selectedYear ||
      this?.maxDate?.getFullYear() == this.selectedYear
    ) {
      if (this?.minDate?.getFullYear() == this.selectedYear) {
        if (this.date.getMonth() <= this.minDate.getMonth())
          this.date.setMonth(this.minDate.getMonth());
      } else if (this?.maxDate?.getFullYear() == this.selectedYear) {
        if (this.date.getMonth() >= this.maxDate.getMonth())
          this.date.setMonth(this.maxDate.getMonth());
      }
    }

    this.date.setDate(1);

    this.firstDayIndex = this.date.getDay(0);
    this.configureAndRenderCalendar();
  }

  // Month is changed
  monthSelected(e) {
    this.leftIconDisabled = false;
    this.rightIconDisabled = false;
    let m = e.target.value;
    this.date.setMonth(m);
    this.selectedMonth = this.date.getMonth();
    // Disable leftIcon/RightIcon if calendar is finished
    this.checkIfCalendarisFinished(this.date.getMonth(), this.selectedYear);

    this.firstDayIndex = this.date.getDay();
    this.configureAndRenderCalendar();
  }

  // Position to render the calendar accordingly
  dropUpOrDown() {
    let dropdownHeight = 288 + 42;
    let windowHeight = this.window.innerHeight;
    let calendarStart =
      this.calendarInput.nativeElement.getBoundingClientRect().top;
    if (windowHeight - calendarStart < dropdownHeight) {
      return 'dropup';
    } else {
      return 'dropdown';
    }
  }

  // Assign 100 years starting from (currentYear-100);
  yearAssigner() {
    this.years = [];
    let currentYear = new Date().getFullYear();
    let startYear = Number(currentYear) - 100;
    for (let i = startYear; i <= currentYear; i++) {
      this.years.push({ val: `${i}` });
    }
  }

  checkIfCalendarisFinished(month, year) {
    if (month == 0 && year == this.years[0].val) {
      this.leftIconDisabled = true;
    } else if (month == 11 && year == this.years[this.years.length - 1].val) {
      this.rightIconDisabled = true;
    }
  }

  checkIfDateisLessThanMinDate(d) {
    if (
      new Date(this.date.getFullYear(), this.date.getMonth(), d).getTime() <
      this?.minDate?.getTime()
    ) {
      return true;
    } else return false;
  }

  checkIfDateisEqualtoMinDate(d) {
    if (
      new Date(this.date.getFullYear(), this.date.getMonth(), d).getTime() ==
      this?.minDate?.getTime()
    ) {
      return true;
    } else return false;
  }

  checkIfDateisEqualtoMaxDate(d) {
    if (
      new Date(this.date.getFullYear(), this.date.getMonth(), d).getTime() ==
      this?.maxDate?.getTime()
    ) {
      return true;
    } else return false;
  }

  checkIfDateisGreaterThanMaxDate(d) {
    if (
      new Date(this.date.getFullYear(), this.date.getMonth(), d).getTime() >
      this?.maxDate?.getTime()
    ) {
      return true;
    } else return false;
  }

  renderSelectedDate() {
    this.leftIconDisabled = false;
    this.rightIconDisabled = false;
    this.date.setYear(this.displayDate?.getFullYear());
    this.date.setMonth(this.displayDate?.getMonth());
    this.date.setDate(this.displayDate?.getDate());
    this.firstDayIndex = new Date(
      this.displayDate?.getFullYear(),
      this.displayDate?.getMonth(),
      1
    ).getDay();
    this.selectedYear = this.displayDate?.getFullYear();
    this.selectedMonth = this.displayDate?.getMonth();
    this.checkIfCalendarisFinished(this.selectedMonth, this.selectedYear);
    this.configureAndRenderCalendar();
  }

  setDisplayDateAccordingtoInput() {
    if (this.minDate != null && this.maxDate != null) {
      if (
        this?.selectedValue?.getTime() >= this?.minDate?.getTime() &&
        this?.selectedValue?.getTime() <= this?.maxDate?.getTime()
      ) {
        this.displayDate = this.selectedValue;
      }
    } else if (
      this.minDate != null &&
      this?.selectedValue?.getTime() >= this?.minDate?.getTime()
    ) {
      this.displayDate = this.selectedValue;
    } else if (
      this.maxDate != null &&
      this?.selectedValue?.getTime() <= this?.maxDate?.getTime()
    ) {
      this.displayDate = this.selectedValue;
    } else if (this.minDate == null && this.maxDate == null)
      this.displayDate = this.selectedValue;
  }
}
