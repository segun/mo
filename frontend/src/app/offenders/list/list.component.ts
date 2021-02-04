import { first } from 'rxjs/operators';
import { OffenderService } from '../../_services/offender.service';
import { Component, OnInit } from '@angular/core';
import { ExportToCsv } from 'export-to-csv';

@Component({
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  offenders = null;
  displayedOffenders = null;
  searchText = '';
  offenderId;
  offenderDeleted = false;
  classCompleted = false;

  constructor(private offenderService: OffenderService) { }

  ngOnInit(): void {
    this.offenderService.getAll()
      .pipe(first())
      .subscribe(offenders => {
        this.offenders = offenders;
        this.displayedOffenders = offenders;
      });
  }

  deleteOffender() {
    const id = this.offenderId;
    const offender = this.offenders.find(x => x.id === id);
    offender.isDeleting = true;
    this.offenderService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.displayedOffenders = this.offenders.filter(x => x.id !== id);
        this.offenderDeleted = true;
      });
  }

  selectOffender(id: string) {
    console.log("Select Offender Called", id);
    this.offenderId = id;
  }

  completeClass() {
    const id =  this.offenderId;
    const offender = this.offenders.find(x => x.id === id);
    offender.isCompletingClass = true;
    this.offenderService.completeClass(id)
      .pipe(first())
      .subscribe(() => {
        this.displayedOffenders = this.offenders.filter(x => x.id !== id);
        offender.isCompletingClass = false;
        this.classCompleted = true;
      });
  }

  searchOffender(event) {
    this.searchText = event.toLowerCase();
    if (this.searchText.length <= 0) {
      this.displayedOffenders = this.offenders;
      return;
    }

    this.displayedOffenders = this.offenders.filter(x => {
      return x.courtorderid === +this.searchText;
    });

    if (this.displayedOffenders.length !== 0) {
      return;
    }

    this.displayedOffenders = this.offenders.filter(x => {
      return x.class === +this.searchText;
    });

    if (this.displayedOffenders.length !== 0) {
      return;
    }

    this.displayedOffenders = this.offenders.filter(x => {
      return x.year === +this.searchText;
    });

    if (this.displayedOffenders.length !== 0) {
      return;
    }

    this.displayedOffenders = this.offenders.filter(x => {
      return x.email.toLowerCase().indexOf(this.searchText) >= 0
        || x.firstname.toLowerCase().indexOf(this.searchText) >= 0
        || x.lastname.toLowerCase().indexOf(this.searchText) >= 0
        || x.middlename.toLowerCase().indexOf(this.searchText) >= 0
        || x.phonenumber.toLowerCase().indexOf(this.searchText) >= 0;
    });
  }

  exportCSV() {

    const data = this.displayedOffenders;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Offenders',
      useTextFile: false,
      useBom: true,
      // useKeysAsHeaders: true,
      headers: [
        'ID',
        'Email Address',
        'Court Order ID',
        'First Name',
        'Middle Name',
        'Last Name',
        'Phone Number',
        'Class',
        'Year',
        'Archived',
        'Created On',
        'Updated On'
      ],
    };

    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(data);
  }
}
