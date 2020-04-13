export interface TimeSeries {
    cases_time_series?: {
        dailyconfirmed?: string;
        dailydeceased?: string;
        dailyrecovered?: string;
        date?: string;
        totalconfirmed?: string;
        totaldeceased?: string;
        totalrecovered?: string;
    }[];
    key_values?: {
        confirmeddelta?: string;
        counterforautotimeupdate?: string;
        deceaseddelta?: string;
        lastupdatedtime?: string;
        recovereddelta?: string;
        statesdelta?: string;
    }[];
    statewise?: {
        active?: string;
        confirmed?: string;
        deaths?: string;
        deltaconfirmed?: string;
        deltadeaths?: string;
        deltarecovered?: string;
        deltaactive?: string;
        lastupdatedtime?: string;
        recovered?: string;
        state?: string;
        statecode: string;
    }[];
    tested?: {
        source?: string;
        testsconductedbyprivatelabs?: string;
        totalindividualstested?: string;
        totalpositivecases?: string;
        totalsamplestested?: string;
        updatetimestamp?: string;
    }[];
    total?: {
        active?: string;
        confirmed?: string;
        deaths?: string;
        deltaconfirmed?: string;
        deltadeaths?: string;
        deltarecovered?: string;
        deltaactive?: string;
        lastupdatedtime?: string;
        recovered?: string;
        state?: string;
        statecode: string;
    };
}