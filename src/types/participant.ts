export type Competition = {
    _id: string;
    name: string;
    date: string;
    location: string;
};

export type Member = {
    _id: string;
    name: string;
    phone: string;
    disciplines: string[];
    photo: string | null;
};

export type Participant = {
    _id: string;
    competition: Competition;
    member: Member;
    competitionPayment: "Paid" | "Unpaid";
    documentsStatus: "Complete" | "Incomplete";
    incompleteDocuments: string[];
};
