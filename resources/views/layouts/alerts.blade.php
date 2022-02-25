@if(session('danger') !== null)
    <div class="alert alert-danger">
        {{ session('danger') }}
    </div>
@endif