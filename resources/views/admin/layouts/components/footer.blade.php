  <footer class="footer">
      <div class="container-fluid">
          <div class="row">
              <div class="col-md-12 footer-copyright text-center">
                  <p class="mb-0">Copyright {{ \Carbon\Carbon::now()->year }} ©
                      {{ $unor->title ?? config('adminetic.name', 'Adminetic') }} by DOCTYPE NEPAL </p>
              </div>
          </div>
      </div>
  </footer>
