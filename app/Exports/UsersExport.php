<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Collection;
//use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UsersExport implements FromArray, WithHeadings
{
    protected $user;
    protected $headersColumn;


    /**
     * get excel
     *
     * @param Collection $users
     * @param array $headers
     */
    public function __construct(array $users, array $headersColumn)
    {

        $this->user = $users;
        $this->headersColumn = $headersColumn;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function array(): array
    {
        return [$this->user];
    }

    public function headings(): array
    {
        return $this->headersColumn;
    }
}
